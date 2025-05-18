import React, { useState, useEffect, JSX } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Switch,
    Chip,
    Snackbar,
    Alert,
    AlertColor,
    Divider,
    TextField,
    InputAdornment,
    IconButton,
    Pagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { getRestaurantMenu, updateMenuItemAvailability } from '../utils/api';
import {
    MenuResponse,
    Category,
    MenuItem
} from '../types';
import { useTranslation } from 'react-i18next';
import Loading from '../components/Loading';
import { useDebounce } from '../hooks/useDebounce';

interface CountsState {
    totalItems: number;
    inStockItems: number;
    outOfStockItems: number;
}

interface SnackbarState {
    open: boolean;
    message: string;
    severity: AlertColor;
}

const StockManagementPage: React.FC = () => {
    const { t } = useTranslation();

    // State for menu data
    const [loading, setLoading] = useState<boolean>(true);
    const [categories, setCategories] = useState<Category[]>([]);

    // State for search and pagination
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [pageSize, setPageSize] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(1);

    // Apply debounce to search term - wait for 500ms before triggering search
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Stats counts
    const [counts, setItemCounts] = useState<CountsState>({
        totalItems: 0,
        inStockItems: 0,
        outOfStockItems: 0
    });

    // Notification state
    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
        message: '',
        severity: 'success'
    });

    // Fetch menu data when search or pagination changes
    useEffect(() => {
        fetchMenu();
    }, [debouncedSearchTerm, currentPage, pageSize]);

    const fetchMenu = async (): Promise<void> => {
        try {
            setLoading(true);

            // Use the debounced search term for API calls
            const response: MenuResponse = await getRestaurantMenu(
                currentPage,
                pageSize,
                debouncedSearchTerm,
                "name",  // Default sort field
                "asc"    // Default sort direction
            );

            if (response.categories) {
                setCategories(response.categories);

                // Update pagination info from response
                if (response.pageInfo) {
                    setCurrentPage(response.pageInfo.pageNumber);
                    setTotalPages(response.pageInfo.totalPages);
                }

                // Update stats
                if (response.stats) {
                    setItemCounts({
                        totalItems: response.stats.totalItems,
                        inStockItems: response.stats.inStockItems,
                        outOfStockItems: response.stats.outOfStockItems
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching menu data:', error);
            setSnackbar({
                open: true,
                message: t('restaurant.menu.fetchError', 'Failed to load menu items. Please try again.'),
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setSearchTerm(event.target.value);
        setCurrentPage(0); // Reset to first page when search changes
    };

    const handleClearSearch = (): void => {
        setSearchTerm("");
        setCurrentPage(0);
    };

    const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number): void => {
        setCurrentPage(page - 1); // MaterialUI Pagination is 1-based, but our API is 0-based
    };

    const handleAvailabilityToggle = async (menuItemId: number, currentStatus: boolean): Promise<void> => {
        try {
            // Optimistically update UI
            const updatedCategories = categories.map(category => ({
                ...category,
                menuItems: category.menuItems.map(item =>
                    item.id === menuItemId
                        ? { ...item, isAvailable: !currentStatus }
                        : item
                )
            }));

            setCategories(updatedCategories);

            // Update counts
            const newCounts = {
                ...counts,
                inStockItems: currentStatus ? counts.inStockItems - 1 : counts.inStockItems + 1,
                outOfStockItems: currentStatus ? counts.outOfStockItems + 1 : counts.outOfStockItems - 1
            };
            setItemCounts(newCounts);

            // Make API call to update item availability
            await updateMenuItemAvailability(menuItemId, { isAvailable: !currentStatus });

            setSnackbar({
                open: true,
                message: !currentStatus
                    ? t('restaurant.stock.addedToStock', 'Item added to stock.')
                    : t('restaurant.stock.removedFromStock', 'Item removed from stock.'),
                severity: 'success'
            });

        } catch (error) {
            console.error('Error updating menu item availability:', error);

            // Revert changes if API call fails
            const revertedCategories = categories.map(category => ({
                ...category,
                menuItems: category.menuItems.map(item =>
                    item.id === menuItemId
                        ? { ...item, isAvailable: currentStatus }
                        : item
                )
            }));

            setCategories(revertedCategories);

            // Revert counts
            const revertedCounts = {
                ...counts,
                inStockItems: currentStatus ? counts.inStockItems : counts.inStockItems - 1,
                outOfStockItems: currentStatus ? counts.outOfStockItems : counts.outOfStockItems + 1
            };
            setItemCounts(revertedCounts);

            setSnackbar({
                open: true,
                message: t('restaurant.stock.updateError', 'Failed to update stock status. Please try again.'),
                severity: 'error'
            });
        }
    };

    const handleCloseSnackbar = (): void => {
        setSnackbar({ ...snackbar, open: false });
    };

    const renderStatusCounts = (): JSX.Element => (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        textAlign: 'center',
                        borderRadius: 3,
                        backgroundColor: "primary.main",
                        color: "primary.contrastText"
                    }}
                >
                    <Typography variant="h3" fontWeight="bold">
                        {counts.totalItems}
                    </Typography>
                    <Typography variant="body2">{t('restaurant.stock.totalItems', 'Total Items')}</Typography>
                </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        textAlign: 'center',
                        borderRadius: 3,
                        backgroundColor: 'success.light',
                        color: "primary.contrastText"
                    }}
                >
                    <Typography variant="h3" fontWeight="bold">
                        {counts.inStockItems}
                    </Typography>
                    <Typography variant="body2">{t('restaurant.stock.inStock', 'In Stock')}</Typography>
                </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        textAlign: 'center',
                        borderRadius: 3,
                        backgroundColor: 'secondary.main',
                        color: "primary.contrastText"
                    }}
                >
                    <Typography variant="h3" fontWeight="bold">
                        {counts.outOfStockItems}
                    </Typography>
                    <Typography variant="body2">{t('restaurant.stock.outOfStock', 'Out of Stock')}</Typography>
                </Paper>
            </Grid>
        </Grid>
    );

    const renderSearchField = (): JSX.Element => (
        <Box sx={{ mb: 3 }}>
            <TextField
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder={t('restaurant.stock.searchItems', 'Search items...')}
                fullWidth
                variant="outlined"
                size="small"
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                        <InputAdornment position="end">
                            <IconButton onClick={handleClearSearch} size="small">
                                <ClearIcon />
                            </IconButton>
                        </InputAdornment>
                    )
                }}
                sx={{ maxWidth: { xs: '100%', md: '300px' } }}
            />
        </Box>
    );

    // Get all menu items flattened
    const getAllItems = (): MenuItem[] => {
        return categories.flatMap(category =>
            category.menuItems.map(item => ({
                ...item,
                category: category.name
            }))
        );
    };

    const allItems = getAllItems();

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
                    {t('restaurant.stock.title', 'Stock Management')}
                </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {renderStatusCounts()}

            {/* Only Search */}
            {renderSearchField()}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <Loading />
                </Box>
            ) : (
                <>
                    {allItems.length === 0 ? (
                        <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2, my: 2 }}>
                            <Typography variant="body1" color="text.secondary">
                                {t('restaurant.stock.noItemsFound', 'No items found for the selected filters.')}
                            </Typography>
                        </Paper>
                    ) : (
                        <>
                            <Grid container spacing={2}>
                                {allItems.map((item) => (
                                    <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2.4 }} key={item.id}>
                                        <Card
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                position: 'relative',
                                                borderRadius: 3,
                                                height: '100%',
                                                transition: "transform 0.3s, box-shadow 0.3s",
                                                "&:hover": {
                                                    transform: "translateY(-3px)",
                                                    boxShadow: '0px 0px 10px rgba(132, 94, 194, 0.4)',
                                                },
                                            }}
                                        >
                                            <CardMedia
                                                component="img"
                                                sx={{
                                                    width: '100%',
                                                    aspectRatio: '1/1',
                                                    borderRadius: 3,
                                                    objectFit: 'cover',
                                                    opacity: item.isAvailable ? 1 : 0.7,
                                                    filter: item.isAvailable ? 'none' : 'grayscale(40%)',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                image={item.img}
                                                alt={item.name}
                                            />

                                            {/* Item details */}
                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Typography variant="subtitle2" fontWeight="bold" noWrap>
                                                    {item.name}
                                                </Typography>

                                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1, justifyContent: 'space-between' }}>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {item.price}₺
                                                    </Typography>
                                                    <Chip
                                                        label={item.isAvailable
                                                            ? t('restaurant.stock.in', 'In')
                                                            : t('restaurant.stock.out', 'Out')
                                                        }
                                                        color={item.isAvailable ? "success" : "error"}
                                                        sx={{ height: 22, fontSize: '0.7rem' }}
                                                    />
                                                </Box>

                                                {/* Switch for availability */}
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mt: 1
                                                }}>
                                                    <Typography variant="body2">
                                                        {t('restaurant.stock.out', 'Out')}
                                                    </Typography>
                                                    <Switch
                                                        checked={item.isAvailable}
                                                        onChange={() => handleAvailabilityToggle(item.id, item.isAvailable)}
                                                        color="success"
                                                        size="small"
                                                    />
                                                    <Typography variant="body2">
                                                        {t('restaurant.stock.in', 'In')}
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>

                            {/* Pagination */}
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                <Pagination
                                    count={totalPages}
                                    page={currentPage + 1}
                                    onChange={handlePageChange}
                                    color="primary"
                                    showFirstButton
                                    showLastButton
                                />
                            </Box>
                        </>
                    )}
                </>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default StockManagementPage;