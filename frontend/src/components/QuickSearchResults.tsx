import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider, Button, Chip, alpha } from '@mui/material';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, Star, LocationOn } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { SearchResult } from '../types';
import Loading from './Loading';

interface QuickSearchResultsProps {
    results: SearchResult[];
    query: string;
    isLoading: boolean;
    onSeeAllClick: () => void;
}

const QuickSearchResults: React.FC<QuickSearchResultsProps> = ({
    results,
    query,
    isLoading,
    onSeeAllClick
}) => {
    const { t } = useTranslation();

    // No results to show
    if (results.length === 0 && !isLoading) {
        return null;
    }

    // Calculate total matching items
    const totalItems = results.reduce((total, restaurant) => total + restaurant.matchedItems.length, 0);

    // Show max 3 restaurants and 2 items per restaurant
    const limitedResults = results.slice(0, 3).map(restaurant => ({
        ...restaurant,
        matchedItems: restaurant.matchedItems.slice(0, 2)
    }));

    return (
        <Paper
            elevation={4}
            sx={{
                position: 'absolute',
                top: '100%',
                mt: 1.5,
                mx: 'auto',
                width: { xs: '100%', sm: '560px' },
                zIndex: 1000,
                maxHeight: 480,
                overflow: 'auto',
                borderRadius: 3,
                boxShadow: (theme) => `0 8px 18px ${alpha(theme.palette.primary.main, 0.3)}`,
                border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
            }}
        >
            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <Loading />
                </Box>
            ) : (
                <>
                    <Box
                        sx={{
                            p: 2.5,
                            background: 'linear-gradient(135deg, #845EC2 0%, #FF5E78 50%, #FEAC5E 100%)',
                            color: 'white',
                            borderRadius: '12px 12px 0 0'
                        }}
                    >
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
                            {t('search.quickResults', { count: results.length })}
                        </Typography>
                        <Typography variant="body2" >
                            {t('search.matchingItems', { count: totalItems })}
                        </Typography>
                    </Box>

                    <List sx={{ width: '100%', p: 0 }}>
                        {limitedResults.map((restaurant) => (
                            <React.Fragment key={restaurant.restaurantId}>
                                <ListItem
                                    component={Link}
                                    to={`/restaurants/${restaurant.restaurantId}`}
                                    sx={{
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        bgcolor: 'background.paper',
                                        '&:hover': {
                                            bgcolor: "primary.light"
                                        },
                                        py: 1,
                                        px: 2.5
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar
                                            src={restaurant.profileImg  || "https://i.hizliresim.com/m0taj04.jpg"}                                            alt={restaurant.restaurantName}
                                            variant="rounded"
                                            sx={{
                                                width: 60,
                                                height: 60,
                                                mr: 2,
                                                borderRadius: 2,
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle1" fontWeight="bold" noWrap>
                                                {restaurant.restaurantName}
                                            </Typography>
                                        }
                                        secondary={
                                            <Box>
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    mt: 0.5,
                                                    color: 'text.secondary',
                                                    fontSize: '0.75rem'
                                                }}>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            mr: 1.5,
                                                            color: 'text.secondary'
                                                        }}
                                                    >
                                                        <LocationOn sx={{ fontSize: 14, mr: 0.5, color: 'secondary.main' }} />
                                                        <Typography variant="caption" noWrap>
                                                            {restaurant.distanceInKm.toFixed(1)} km
                                                        </Typography>
                                                    </Box>
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            color: 'text.secondary'
                                                        }}
                                                    >
                                                        <Star sx={{ fontSize: 14, mr: 0.5, color: '#FFB800' }} />
                                                        <Typography variant="caption">
                                                            {restaurant.ratings || 0}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                {restaurant.matchedItems.length > 0 && (
                                                    <Chip
                                                        label={`${restaurant.matchedItems.length} ${t('search.items')}`}
                                                        size="small"
                                                        color="primary"
                                                        variant="outlined"
                                                        sx={{
                                                            mt: 0.5,
                                                            height: 20,
                                                            fontSize: '0.7rem',
                                                            '& .MuiChip-label': { px: 1 }
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        }
                                        disableTypography
                                    />
                                </ListItem>

                                {restaurant.matchedItems.length > 0 && (
                                    <Box
                                        sx={{
                                            pl: { xs: 2, sm: 6 },
                                            pr: 2.5,
                                            pb: 0.5,
                                            pt: 0.5,
                                        }}
                                    >
                                        {restaurant.matchedItems.map((item) => (
                                            <Box
                                                key={item.id}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    mb: 1,
                                                    py: 1,
                                                    px: 1.5,
                                                    borderRadius: 2,
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        bgcolor: "primary.light",
                                                        transform: 'translateX(3px)'
                                                    }
                                                }}
                                            >
                                                <Box
                                                    component="img"
                                                    src={item.img}
                                                    alt={item.name}
                                                    sx={{
                                                        width: 42,
                                                        height: 42,
                                                        borderRadius: 1.5,
                                                        mr: 1.5,
                                                        objectFit: 'cover',
                                                        border: '1px solid rgba(0,0,0,0.1)'
                                                    }}
                                                />
                                                <Box sx={{ flexGrow: 1 }}>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: 500,
                                                            fontSize: '0.85rem',
                                                            mb: 0.2
                                                        }}
                                                        noWrap
                                                    >
                                                        {item.name}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="primary.main"
                                                        fontWeight="bold"
                                                        sx={{ fontSize: '0.8rem' }}
                                                    >
                                                        {item.price}₺
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                                <Divider component="li" sx={{ opacity: 0.6 }} />
                            </React.Fragment>
                        ))}
                    </List>

                    <Box sx={{ p: 2.5 }}>
                        <Button
                            variant="contained"
                            onClick={onSeeAllClick}
                            startIcon={<SearchIcon />}
                            fullWidth
                            sx={{ py: 1 }}
                        >
                            {t('search.seeAll')} "{query}"
                        </Button>
                    </Box>
                </>
            )}
        </Paper>
    );
};

export default QuickSearchResults;