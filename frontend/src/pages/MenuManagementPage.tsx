import React, { useState } from 'react';
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
    MenuItem,
    Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Define interface for menu item
interface MenuItem {
    id: number;
    name: string;
    price: number;
    description: string;
    image: string;
    category: string;
    removableElements?: string[];
}

// Sample data for menu items
const initialMenuItems: MenuItem[] = [
    {
        id: 1,
        name: 'Chicken Burger',
        price: 280,
        description: '1 McChicken™, 1 Big Mac™, 1 Royal Cheeseburger, 3 medium',
        image: 'https://picsum.photos/100/120',
        category: 'Offers',
        removableElements: ['domates', "soğan"]
    },
    {
        id: 2,
        name: 'Cheese Burger',
        price: 280,
        description: '1 McChicken™, 1 Big Mac™, 1 Royal Cheeseburger, 3 medium',
        image: 'https://picsum.photos/101/120',
        category: 'Offers',
        removableElements: ['zeytin', "sucuk", "mısır"]
    },
    {
        id: 3,
        name: 'Chicken Burger',
        price: 280,
        description: '1 McChicken™, 1 Big Mac™, 1 Royal Cheeseburger, 3 medium',
        image: 'https://picsum.photos/102/120',
        category: 'Burgers'
    },
    {
        id: 4,
        name: 'Cheese Burger',
        price: 280,
        description: '1 McChicken™, 1 Big Mac™, 1 Royal Cheeseburger, 3 medium',
        image: 'https://picsum.photos/105/120',
        category: 'Burgers'
    }
];

// Component for rendering menu items grouped by category
const MenuManagementPage: React.FC = () => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
    const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
    const [openItemDialog, setOpenItemDialog] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [newItem, setNewItem] = useState<Omit<MenuItem, 'id'>>({
        name: '',
        price: 0,
        description: '',
        image: 'https://picsum.photos/101/105',
        category: '',
        removableElements: []
    });
    const [newElement, setNewElement] = useState('');

    // Handler for adding a removable element
    const handleAddElement = () => {
        if (newElement.trim() !== '') {
            setNewItem({
                ...newItem,
                removableElements: [...(newItem.removableElements || []), newElement]
            });
            setNewElement('');
        }
    };

    // Handler for removing an element
    const handleRemoveElement = (element: string) => {
        setNewItem({
            ...newItem,
            removableElements: newItem.removableElements?.filter(el => el !== element)
        });
    };

    // Group menu items by category
    const groupedItems = menuItems.reduce<Record<string, MenuItem[]>>((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {});

    // Get all categories
    const categories = Object.keys(groupedItems);

    // Handler for deleting a menu item
    const handleDelete = (id: number) => {
        setMenuItems(menuItems.filter(item => item.id !== id));
    };

    // Handlers for category dialog
    const handleOpenCategoryDialog = () => setOpenCategoryDialog(true);
    const handleCloseCategoryDialog = () => {
        setOpenCategoryDialog(false);
        setNewCategory('');
    };

    // Handler for adding a new category
    const handleAddCategory = () => {
        if (newCategory.trim() !== '') {
            // Since we don't have a real API call, we're just closing the dialog
            // In a real app, you would make an API call to add the category
            handleCloseCategoryDialog();
        }
    };

    // Handlers for item dialog
    const handleOpenItemDialog = (category: string) => {
        setSelectedCategory(category);
        setNewItem({ ...newItem, category });
        setOpenItemDialog(true);
    };

    const handleCloseItemDialog = () => {
        setOpenItemDialog(false);
        setNewItem({
            name: '',
            price: 0,
            description: '',
            image: 'https://picsum.photos/101/105',
            category: '',
            removableElements: []
        });
        setNewElement('');
    };

    // Handler for adding a new item
    const handleAddItem = () => {
        if (newItem.name.trim() !== '' && newItem.price > 0) {
            const newId = Math.max(...menuItems.map(item => item.id), 0) + 1;
            const itemToAdd = { ...newItem, id: newId, category: selectedCategory };
            setMenuItems([...menuItems, itemToAdd]);
            handleCloseItemDialog();
        }
    };

    // Handler for form changes
    const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewItem({
            ...newItem,
            [name]: name === 'price' ? parseFloat(value) : value
        });
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
                    Manage Menu
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCategoryDialog}
                >
                    Add New Category
                </Button>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Menu categories and items */}
            {Object.entries(groupedItems).map(([category, items]) => (
                <Box key={category} sx={{ mb: 4 }}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: { xs: 2, sm: 0 },
                        mb: 2
                    }}>
                        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                            {category}
                        </Typography>
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenItemDialog(category)}
                            sx={{
                                bgcolor: '#8d68c5',
                                '&:hover': { bgcolor: '#7b5aae' },
                                alignSelf: { xs: 'flex-start', sm: 'auto' }
                            }}
                        >
                            Add New Item
                        </Button>
                    </Box>

                    {/* Menu items */}
                    <Box>
                        {items.map(item => (
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
                                        image={item.image}
                                        alt={item.name}
                                    />
                                    <CardContent sx={{ width: { xs: '100%', sm: 'auto' } }}>
                                        <Typography variant="h6" component="div">
                                            {item.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {item.description}
                                        </Typography>

                                        {item.removableElements ?
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                                {item.removableElements.map(removableElement => (
                                                    <Chip
                                                        label={removableElement}
                                                        onDelete={() => console.log(removableElement)}
                                                        sx={{
                                                            bgcolor: 'white',
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                            : <></>}

                                        <Box sx={{ display: "flex", alignItems: 'center', gap: 2, mt: 1 }}>
                                            <TextField
                                                placeholder="Add removable element"
                                                variant="outlined"
                                                size="small"
                                                value={newElement}
                                                onChange={(e) => setNewElement(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddElement();
                                                    }
                                                }}
                                            />
                                            <Button
                                                variant="contained"
                                                size='small'
                                                startIcon={<AddIcon />}
                                                onClick={handleAddElement}
                                                sx={{
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                Add New
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
                                        <IconButton size="small" color="primary">
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
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
                <DialogTitle>Add New Category</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="category"
                        label="Category Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleCloseCategoryDialog}>Cancel</Button>
                    <Button
                        onClick={handleAddCategory}
                        variant="contained"
                    >
                        Add
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add Item Dialog */}
            <Dialog fullWidth maxWidth="sm" open={openItemDialog} onClose={handleCloseItemDialog}>
                <DialogTitle>Add New Item to {selectedCategory}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        name="name"
                        label="Item Name"
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
                        label="Price (₺)"
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
                        label="Description"
                        type="text"
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        value={newItem.description}
                        onChange={handleItemChange}
                    />

                    {/* Image Upload Section */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Product Image
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
                                    backgroundImage: newItem.image ? `url(${newItem.image})` : 'none',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                }}
                            >
                                {!newItem.image && <Typography color="text.secondary">No Image</Typography>}
                            </Box>
                            <Button
                                variant="outlined"
                                component="label"
                                sx={{ height: 40 }}
                            >
                                Upload Image
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            // In a real app, you would upload this file to a server
                                            // and get back a URL. Here we're just using a placeholder.
                                            setNewItem({
                                                ...newItem,
                                                image: '/api/placeholder/100/100'
                                            });
                                        }
                                    }}
                                />
                            </Button>
                        </Box>
                    </Box>

                    {/* Removable Elements Section */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Removable Elements:
                        </Typography>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            {newItem.removableElements?.map((element, index) => (
                                <Chip
                                    key={index}
                                    label={element}
                                    onDelete={() => handleRemoveElement(element)}
                                    sx={{
                                        bgcolor: 'primary.light',
                                    }}
                                />
                            ))}
                        </Box>

                        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                            <TextField
                                placeholder="Enter new removable element"
                                variant="outlined"
                                size="small"
                                value={newElement}
                                onChange={(e) => setNewElement(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddElement();
                                    }
                                }}
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
                                Add New
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleCloseItemDialog}>Cancel</Button>
                    <Button
                        onClick={handleAddItem}
                        variant="contained"
                    >
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MenuManagementPage;