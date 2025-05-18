import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Container, Grid, Alert, Stack, Button, Divider } from '@mui/material';
import { getPopularMenuItems } from '../utils/api';
import { useTranslation } from 'react-i18next';
import { getCurrentAddress } from '../utils/api';
import { Link, useNavigate } from 'react-router-dom';
import PopularFoodCard from '../components/menu/PopularFoodCard';
import { PopularFoodCardSkeleton } from './CustomerHomePage';
import { Food } from '../types';
import Loading from '../components/Loading';

const PopularFoodsPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [foods, setFoods] = useState<Food[]>([]);
    const [hasAddress, setHasAddress] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [initialLoadComplete, setInitialLoadComplete] = useState<boolean>(false);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Check if user has a selected address
    const checkAddress = useCallback(async () => {
        try {
            const currentAddress = await getCurrentAddress();
            if (currentAddress) {
                setHasAddress(true);
                return true;
            }
            setHasAddress(false);
            return false;
        } catch (error) {
            console.error('Failed to get current address', error);
            setHasAddress(false);
            return false;
        }
    }, []);

    // Load popular menu items
    const loadPopularItems = useCallback(async (pageNum: number, initialLoad: boolean = false) => {
        if (initialLoad) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const hasValidAddress = await checkAddress();
            if (!hasValidAddress) {
                setError(t('error.noAddress'));
                setLoading(false);
                setLoadingMore(false);
                return;
            }

            const result = await getPopularMenuItems(pageNum, 10);

            // Map the API response to our Food interface
            const newFoods = result.content.filter(mi => mi.isAvailable).map(mi => ({
                id: mi.id,
                name: mi.name,
                image: mi.img,
                restaurant: mi.restaurant,
                price: `${mi.price}₺`,
                description: mi.description
            }));

            if (initialLoad) {
                setFoods(newFoods);
            } else {
                setFoods(prev => [...prev, ...newFoods]);
            }

            // Check if there are more items to load
            setHasMore(result.pageInfo.pageNumber < result.pageInfo.totalPages - 1);
            setInitialLoadComplete(true);
        } catch (err) {
            console.error('Failed to load popular menu items', err);
            setError(t('error.loadingFailed'));
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [t, checkAddress]);

    // Initial load
    useEffect(() => {
        loadPopularItems(0, true);
    }, [loadPopularItems]);

    // Set up intersection observer for infinite scrolling
    useEffect(() => {
        // Disconnect previous observer if it exists
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        // Create new intersection observer
        const observer = new IntersectionObserver(
            entries => {
                // If the load more element is visible and we're not currently loading
                if (entries[0].isIntersecting && hasMore && !loadingMore && initialLoadComplete) {
                    setPage(prevPage => {
                        const nextPage = prevPage + 1;
                        loadPopularItems(nextPage);
                        return nextPage;
                    });
                }
            },
            { threshold: 0.1 }
        );

        // Observe the load more element if it exists
        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        // Store the observer in the ref
        observerRef.current = observer;

        // Clean up observer on component unmount
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [hasMore, loadingMore, initialLoadComplete, loadPopularItems]);

    // If no address selected, redirect to homepage after showing message
    useEffect(() => {
        if (!hasAddress && initialLoadComplete) {
            const timer = setTimeout(() => {
                navigate('/');
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [hasAddress, initialLoadComplete, navigate]);

    return (
        <>
            <Box sx={{ mb: 3 }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: { xs: 'center', sm: 'space-between' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: { xs: 1, sm: 0 },
                    mb: 1
                }}>
                    <Stack>
                        <Typography variant="h5" fontWeight={700} mb={1}>
                            {t('popularFoods.pageTitle')}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {t('popularFoods.description')}
                        </Typography>
                    </Stack>

                    <Button
                        component={Link}
                        to="/restaurants"
                        variant="outlined"
                        size="small"
                        sx={{ textTransform: 'none' }}
                    >
                        {t('restaurants.browse')}
                    </Button>
                </Box>
                <Divider sx={{ mt: 2, mb: 3 }} />
            </Box>

            {error && (
                <Alert severity="error" sx={{ my: 2 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                // Initial loading
                <Grid container spacing={2}>
                    {Array.from(new Array(10)).map((_, index) => (
                        <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2.4 }} key={`skeleton-${index}`}>
                            <PopularFoodCardSkeleton />
                        </Grid>
                    ))}
                </Grid>
            ) : foods.length > 0 ? (
                // Display foods
                <Grid container spacing={2}>
                    {foods.map((food) => (
                        <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2.4 }} key={food.id}>
                            <PopularFoodCard food={food} />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6">
                        {t('popularFoods.noItems')}
                    </Typography>
                </Box>
            )}

            {/* Load more indicator */}
            {hasMore && !error && (
                <Box
                    ref={loadMoreRef}
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        py: 4,
                        mt: 2
                    }}
                >
                    {loadingMore && <Loading />}
                </Box>
            )}

            {/* End of list message */}
            {!hasMore && foods.length > 0 && (
                <Box sx={{ textAlign: 'center', py: 4, mt: 2 }}>
                    <Typography variant="body1" color="text.secondary">
                        {t('popularFoods.endOfList')}
                    </Typography>
                </Box>
            )}
        </>
    );
};

export default PopularFoodsPage;