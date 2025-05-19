import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    IconButton,
    Divider,
    Card,
    CardContent,
    CardMedia,
    CardActions,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { addMenuCategory, addMenuItem, addRemovableElement, deleteMenuCategory, deleteMenuItem, deleteRemovableElement, getRestaurantMenu, updateMenuItem } from '../utils/api';
import defaultFoodImg from "../assets/menuitem.png";
import { Category } from '../types';
import { useTranslation } from 'react-i18next';


// Define interface for removable element response
interface RemovableElementResponse {
    id: number;
    name: string;
}

// Define interface for menu item
interface MenuItem {
    id: number;
    name: string;
    price: number;
    description: string;
    img: string;
    removableElements?: RemovableElementResponse[];
}


// Component for rendering menu items grouped by category
const MenuManagementPage: React.FC = () => {
    const { t } = useTranslation();
    const [categories, setCategories] = useState<Category[]>([]);
    const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
    const [openItemDialog, setOpenItemDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [imageError, setImageError] = useState(false);
    const [imageErrorMsg, setImageErrorMsg] = useState("");
    const [newItem, setNewItem] = useState<Omit<MenuItem, 'id'>>({
        name: '',
        price: 0,
        description: '',
        img: '',
        removableElements: [] as RemovableElementResponse[]
    });
    const [newElement, setNewElement] = useState('');
    const [itemRemovableElements, setItemRemovableElements] = useState<{ [itemId: number]: string }>({});

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        try {
            const menuData = await getRestaurantMenu(
                0,
                10000,
                "",
                undefined,
                undefined
            );
            setCategories(menuData.categories || []);
        } catch (error) {
            // error
        }
    };

    // Handler for adding a removable element
    const handleAddElement = () => {
        if (newElement.trim() !== '') {
            setNewItem({
                ...newItem,
                removableElements: [
                    ...(Array.isArray(newItem.removableElements) ? newItem.removableElements : []),
                    { id: -1, name: newElement.trim() }
                ]
            });
            setNewElement('');
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const maxSizeInBytes = 1 * 1024 * 1024;
            if (file.size > maxSizeInBytes) {
                setImageError(true);
                setImageErrorMsg(t('profile.max'));
                return;
            }
            setImageError(false);
            setImageErrorMsg("");
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setNewItem((prevItem) => ({
                    ...prevItem,
                    img: base64
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Handler for removing element from the form
    const handleRemoveElement = (elementName: string) => {
        setNewItem({
            ...newItem,
            removableElements: (newItem.removableElements || []).filter(
                element => element.name !== elementName
            )
        });
    };

    // Helper function to get image URL
    const getImageUrl = (imgUrl: string) => {
        // If img is empty or undefined, return default image
        return imgUrl && imgUrl.trim() !== '' ? imgUrl : defaultFoodImg;

    };

    // Handler for adding or updating an item
    const handleSaveItem = async () => {
        if (newItem.name.trim() !== '' && newItem.price > 0 && selectedCategoryId !== null) {
            try {
                const itemToSend = {
                    name: newItem.name,
                    price: newItem.price,
                    description: newItem.description || '',
                    img: newItem.img || defaultFoodImg,  // Use default image if none provided
                    removableElements: (newItem.removableElements || []).map(el => el.name).join(',')
                };

                if (isEditing && selectedItem) {
                    await updateMenuItem(selectedItem.id, itemToSend);
                } else {
                    await addMenuItem(selectedCategoryId, itemToSend);
                }

                // Fetch fresh data instead of trying to update state manually
                await fetchMenu();
                handleCloseItemDialog();
            } catch (error) {
                console.error(isEditing ? t('menuManagement.error.updateItem') : t('menuManagement.error.addItem'), error);
            }
        } else {
            alert(t('menuManagement.alert.fillRequired'));
        }
    };

    // Handler for adding a new category
    const handleAddCategory = async () => {
        if (newCategory.trim() !== '') {
            try {
                await addMenuCategory(newCategory);
                // Fetch fresh data instead of trying to update state manually
                await fetchMenu();
                handleCloseCategoryDialog();
            } catch (error) {
                console.error(t('menuManagement.error.addCategory'), error);
            }
        }
    };

    // Handler for deleting a menu item
    const handleDeleteItem = async (itemId: number) => {
        try {
            await deleteMenuItem(itemId);
            // Fetch fresh data instead of trying to update state manually
            await fetchMenu();
        } catch (error) {
            console.error(t('menuManagement.error.deleteItem'), error);
            alert(t('menuManagement.alert.deleteItemFailed'));
        }
    };

    // Handler for deleting a removable element
    const handleDeleteRemovableItem = async (itemId: number) => {
        try {
            await deleteRemovableElement(itemId);
            await fetchMenu();
        } catch (error) {
            console.error(t('menuManagement.error.deleteRemovable'), error);
            alert(t('menuManagement.alert.deleteRemovableFailed'));
        }
    };

    // Handler for deleting a category
    const handleDeleteCategory = async (categoryId: number) => {
        try {
            await deleteMenuCategory(categoryId);
            await fetchMenu();
        } catch (error) {
            console.error(t('menuManagement.error.deleteCategory'), error);
            alert(t('menuManagement.alert.deleteCategoryFailed'));
        }
    };

    // Handlers for category dialog
    const handleOpenCategoryDialog = () => setOpenCategoryDialog(true);
    const handleCloseCategoryDialog = () => {
        setOpenCategoryDialog(false);
        setNewCategory('');
    };

    // Handlers for item dialog
    const handleOpenItemDialog = (categoryId: number, categoryName: string) => {
        setSelectedCategoryId(categoryId);
        setSelectedCategoryName(categoryName);
        setIsEditing(false);
        setSelectedItem(null);
        setNewItem({
            name: '',
            price: 0,
            description: '',
            img: '', // Default empty, will use DEFAULT_IMAGE_URL when saving
            removableElements: [] as RemovableElementResponse[]
        });
        setOpenItemDialog(true);
    };

    // Handler for opening edit dialog
    const handleOpenEditDialog = (categoryId: number, categoryName: string, item: MenuItem) => {
        setSelectedCategoryId(categoryId);
        setSelectedCategoryName(categoryName);
        setIsEditing(true);
        setSelectedItem(item);
        setNewItem({
            name: item.name,
            price: item.price,
            description: item.description,
            img: item.img,
            removableElements: item.removableElements || []
        });
        setOpenItemDialog(true);
    };

    const handleCloseItemDialog = () => {
        setOpenItemDialog(false);
        setIsEditing(false);
        setSelectedItem(null);
        setNewItem({
            name: '',
            price: 0,
            description: '',
            img: '',
            removableElements: []
        });
        setNewElement('');
        setImageError(false);
        setImageErrorMsg("");
    };

    // Handler for form changes
    const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewItem({
            ...newItem,
            [name]: name === 'price' ? parseFloat(value) : value
        });
    };

    const handleAddElementToItem = async (itemId: number) => {
        const elementText = itemRemovableElements[itemId];
        if (elementText && elementText.trim() !== '') {
            try {
                await addRemovableElement(itemId, elementText.trim());

                // Clear the input for this specific item
                setItemRemovableElements(prev => ({
                    ...prev,
                    [itemId]: ''
                }));

                // Refresh menu data to show the new element
                await fetchMenu();
            } catch (error) {
                console.error(t('menuManagement.error.addRemovable'), error);
                alert(t('menuManagement.alert.addRemovableFailed'));
            }
        }
    };

    const handleItemElementChange = (itemId: number, value: string) => {
        setItemRemovableElements(prev => ({
            ...prev,
            [itemId]: value
        }));
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
                    {t('menuManagement.title')}
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCategoryDialog}
                >
                    {t('menuManagement.addNewCategory')}
                </Button>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Menu categories and items */}
            {categories?.map(category => (
                <Box key={category.id} sx={{ mb: 4 }}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: { xs: 2, sm: 0 },
                        mb: 2
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                                {category.name}
                            </Typography>
                            <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteCategory(category.id)}
                                aria-label={t('menuManagement.aria.deleteCategory')}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenItemDialog(category.id, category.name)}
                            sx={{
                                alignSelf: { xs: 'flex-start', sm: 'auto' }
                            }}
                        >
                            {t('menuManagement.addNewItem')}
                        </Button>
                    </Box>

                    {/* Menu items */}
                    <Box>
                        {(category.menuItems || []).map(item => (
                            <Card
                                key={item.id}
                                sx={{
                                    mb: 2,
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    justifyContent: 'space-between',
                                    bgcolor: 'primary.light',
                                    borderRadius: 2
                                }}
                            >
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    alignItems: { xs: 'left', sm: 'flex-start' },
                                    width: { xs: '100%', sm: 'auto' }
                                }}>
                                    <CardMedia
                                        component="img"
                                        sx={{
                                            width: { xs: 160, sm: 80 },
                                            height: { xs: 160, sm: 80 },
                                            m: 2,
                                            borderRadius: 2
                                        }}
                                        image={getImageUrl(item.img)}
                                        alt={item.name}
                                    />
                                    <CardContent sx={{ width: { xs: '100%', sm: 'auto' } }}>
                                        <Typography variant="h6" component="div">
                                            {item.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {item.description}
                                        </Typography>

                                        {item.removableElements && item.removableElements.length > 0 && (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                                {item.removableElements.map(removableElement => (
                                                    <Chip
                                                        key={removableElement.id}
                                                        label={removableElement.name}
                                                        sx={{ bgcolor: 'background.default' }}
                                                        onDelete={() => handleDeleteRemovableItem(removableElement.id)}
                                                    />
                                                ))}
                                            </Box>
                                        )}

                                        {/* Add removable element section on page */}
                                        <Box sx={{ display: "flex", alignItems: 'center', gap: 2, mt: 1.2 }}>
                                            <TextField
                                                placeholder={t('menuManagement.placeholder.addRemovable')}
                                                variant="outlined"
                                                size="small"
                                                value={itemRemovableElements[item.id] || ''}
                                                onChange={(e) => handleItemElementChange(item.id, e.target.value)}
                                            />
                                            <Button
                                                variant="contained"
                                                size='small'
                                                startIcon={<AddIcon />}
                                                onClick={() => handleAddElementToItem(item.id)}
                                                sx={{
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {t('menuManagement.addNew')}
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Box>

                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: { xs: 'space-between', sm: 'flex-end' },
                                    p: { xs: 2, sm: 0 },
                                    pr: 2,
                                    width: { xs: '100%', sm: 'auto' }
                                }}>
                                    <Typography variant="h6" color="#8d68c5" sx={{ fontWeight: 'bold', mr: 2 }}>
                                        {item.price}₺
                                    </Typography>
                                    <CardActions>
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={() => handleOpenEditDialog(category.id, category.name, item)}
                                            aria-label={t('menuManagement.aria.editItem')}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleDeleteItem(item.id)}
                                            aria-label={t('menuManagement.aria.deleteItem')}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </CardActions>
                                </Box>
                            </Card>
                        ))}
                    </Box>
                </Box>
            ))}

            {/* Add Category Dialog */}
            <Dialog fullWidth maxWidth="sm" open={openCategoryDialog} onClose={handleCloseCategoryDialog}>
                <DialogTitle>{t('menuManagement.dialog.addCategory')}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="category"
                        label={t('menuManagement.label.categoryName')}
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleCloseCategoryDialog}>{t('util.cancel')}</Button>
                    <Button
                        onClick={handleAddCategory}
                        variant="contained"
                    >
                        {t('util.add')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add/Edit Item Dialog */}
            <Dialog fullWidth maxWidth="sm" open={openItemDialog} onClose={handleCloseItemDialog}>
                <DialogTitle>
                    {isEditing ? t('menuManagement.dialog.editItem') : t('menuManagement.dialog.addItemTo', { name: selectedCategoryName })}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        name="name"
                        label={t('menuManagement.label.itemName')}
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newItem.name}
                        onChange={handleItemChange}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        id="price"
                        name="price"
                        label={t('menuManagement.label.price')}
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={newItem.price}
                        onChange={handleItemChange}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        id="description"
                        name="description"
                        label={t('menuManagement.label.description')}
                        type="text"
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        value={newItem.description}
                        onChange={handleItemChange}
                    />

                    {/* Image Upload Section */}
                    <Box sx={{ mb: 2, mt: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            {t('menuManagement.label.productImage')}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                                sx={{
                                    width: 100,
                                    height: 100,
                                    bgcolor: 'grey.200',
                                    borderRadius: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundImage: `url(${newItem.img || defaultFoodImg})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                }}
                            >
                                {!newItem.img && !isEditing && <AddIcon />}
                            </Box>
                            <Button variant="outlined" component="label" sx={{ height: 40 }}>
                                {t('menuManagement.uploadImage')}
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </Button>
                        </Box>
                        {imageError && (
                            <Typography variant="body2" color="error" mt={1}>
                                {imageErrorMsg}
                            </Typography>
                        )}
                    </Box>

                    {/* Removable Elements Section */}
                    {!isEditing &&
                        <Box sx={{ mb: 2, mt: 3 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                {t('menuManagement.label.removableElements')}
                            </Typography>

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                {(newItem.removableElements || []).map((element, index) => (
                                    <Chip
                                        key={index}
                                        label={element.name}
                                        onDelete={() => handleRemoveElement(element.name)}
                                        sx={{
                                            bgcolor: 'primary.light',
                                        }}
                                    />
                                ))}
                            </Box>

                            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                                <TextField
                                    placeholder={t('menuManagement.placeholder.newRemovable')}
                                    variant="outlined"
                                    size="small"
                                    value={newElement}
                                    onChange={(e) => setNewElement(e.target.value)}
                                    sx={{
                                        flexGrow: 1,
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={handleAddElement}
                                    sx={{
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {t('menuManagement.addElement')}
                                </Button>
                            </Box>
                        </Box>}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleCloseItemDialog}>{t('util.cancel')}</Button>
                    <Button
                        onClick={handleSaveItem}
                        variant="contained"
                    >
                        {isEditing ? t('util.saveChanges') : t('util.add')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MenuManagementPage;