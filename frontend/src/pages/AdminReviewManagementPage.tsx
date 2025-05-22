import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    IconButton,
    Card,
    Avatar,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Paper,
    alpha,
    useMediaQuery,
    useTheme,
    CircularProgress,
    ToggleButton,
    ToggleButtonGroup,
    Menu,
    MenuItem,
    Snackbar,
    Alert,
    Tooltip,
} from "@mui/material";
import {
    Delete as DeleteIcon,
    Restaurant as RestaurantIcon,
    Person as PersonIcon,
    AccessTime as AccessTimeIcon,
    Refresh as RefreshIcon,
    Sort as SortIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon,
    StarOutline as StarOutlineIcon,
    Close as CloseIcon,
} from "@mui/icons-material";
import { getAllReviews, deleteReview, deleteRestaurantReply } from '../utils/api';
import { ReviewDTOforAdmin } from '../types';
import { useTranslation } from "react-i18next";
import Loading from '../components/Loading';

const AdminReviewManagementPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    // State management
    const [reviews, setReviews] = useState<ReviewDTOforAdmin[]>([]);
    const [filter, setFilter] = useState<"all" | "with_replies">("all");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const [deleteReplyDialogOpen, setDeleteReplyDialogOpen] = useState<boolean>(false);
    const [selectedReview, setSelectedReview] = useState<ReviewDTOforAdmin | null>(null);
    const [selectedReplyReview, setSelectedReplyReview] = useState<ReviewDTOforAdmin | null>(null);
    const [sortOrder, setSortOrder] = useState<"recent" | "oldest">("recent");
    const [loading, setLoading] = useState<boolean>(false);
    const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
    const [deleteReplyLoading, setDeleteReplyLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const sortMenuOpen = Boolean(anchorEl);

    // Fetch reviews
    const fetchReviews = async () => {
        try {
            setLoading(true);
            const data = await getAllReviews();
            setReviews(data);
            setError(null);
        } catch (err: any) {
            console.error("Error fetching reviews:", err);
            setError(err.message || t('adminReviewManagement.errorLoading'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    // Filter handler
    const handleFilterChange = (
        _event: React.MouseEvent<HTMLElement>,
        newFilter: "all" | "with_replies" | null
    ) => {
        if (newFilter !== null) {
            setFilter(newFilter);
        }
    };

    // Sort menu handlers
    const handleSortMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleSortMenuClose = () => {
        setAnchorEl(null);
    };

    // Handle sort change
    const handleSortChange = (
        sortType: "recent" | "oldest"
    ) => {
        setSortOrder(sortType);
        setAnchorEl(null);
    };

    // Delete handlers
    const handleDeleteClick = (review: ReviewDTOforAdmin) => {
        setSelectedReview(review);
        setDeleteDialogOpen(true);
    };

    const handleDeleteReplyClick = (review: ReviewDTOforAdmin) => {
        setSelectedReplyReview(review);
        setDeleteReplyDialogOpen(true);
    };

    const handleDeleteReview = async () => {
        if (!selectedReview?.id) return;

        try {
            setDeleteLoading(true);
            await deleteReview(selectedReview.id);
            setSuccessMessage(t('adminReviewManagement.deleteSuccess', { userName: selectedReview.userName }));
            await fetchReviews();
            setDeleteDialogOpen(false);
            setSelectedReview(null);
        } catch (err: any) {
            console.error('Failed to delete review:', err);
            setError(err?.message || t('adminReviewManagement.errorLoading'));
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleDeleteRestaurantReply = async () => {
        if (!selectedReplyReview?.id) return;

        try {
            setDeleteReplyLoading(true);
            await deleteRestaurantReply(selectedReplyReview.id);
            setSuccessMessage(t('adminReviewManagement.deleteReplySuccess'));
            await fetchReviews();
            setDeleteReplyDialogOpen(false);
            setSelectedReplyReview(null);
        } catch (err: any) {
            console.error('Failed to delete restaurant reply:', err);
            setError(err?.message || t('adminReviewManagement.errorLoading'));
        } finally {
            setDeleteReplyLoading(false);
        }
    };

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setSelectedReview(null);
    };

    const closeDeleteReplyDialog = () => {
        setDeleteReplyDialogOpen(false);
        setSelectedReplyReview(null);
    };

    // Date formatting
    const formatDate = (dateValue: any): string => {
        try {
            const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';

            if (Array.isArray(dateValue)) {
                const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
                const date = new Date(year, month - 1, day, hour, minute, second);
                if (!isNaN(date.getTime())) {
                    return date.toLocaleDateString(locale, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    });
                }
            } else if (typeof dateValue === "string") {
                const date = new Date(dateValue);
                if (!isNaN(date.getTime())) {
                    return date.toLocaleDateString(locale, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    });
                }
            }
            console.warn("Could not parse date:", dateValue);
            return t('adminReviewManagement.unknownDate');
        } catch (error) {
            console.error("Error parsing date:", error);
            return t('adminReviewManagement.unknownDate');
        }
    };

    // Filter reviews
    const filteredReviews = reviews.filter((review) => {
        if (filter === "all") return true;
        if (filter === "with_replies") return review.restaurantReply && review.restaurantReply.trim() !== '';
        return true;
    });

    // Sort reviews
    const sortedReviews = [...filteredReviews].sort((a, b) => {
        const dateA = new Date(a.reviewDate).getTime();
        const dateB = new Date(b.reviewDate).getTime();
        return sortOrder === "recent" ? dateB - dateA : dateA - dateB;
    });

    // Sort label
    const getSortLabel = () => {
        switch (sortOrder) {
            case "recent":
                return t('adminReviewManagement.mostRecent');
            case "oldest":
                return t('adminReviewManagement.oldestFirst');
            default:
                return t('adminReviewManagement.sort');
        }
    };

    return (
        <Box
            sx={{
                p: { xs: 2, sm: 4 },
                backgroundColor: "background.default",
                borderRadius: 3,
                minHeight: "100vh",
                fontFamily: "'Montserrat', sans-serif",
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                    mb: 3,
                    pb: 2,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                }}
            >
                <Typography
                    variant="h5"
                    component="h1"
                    fontWeight="bold"
                    sx={{
                        background: theme.palette.primary.main,
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        color: "transparent",
                        display: "inline-block",
                    }}
                >
                    {t('adminReviewManagement.title')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                        icon={<StarOutlineIcon />}
                        label={`${reviews.length} ${t('adminReviewManagement.totalReviews')}`}
                        sx={{
                            fontWeight: 600,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            borderRadius: 50,
                            px: 1,
                        }}
                    />
                    <Button
                        variant="outlined"
                        startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
                        onClick={fetchReviews}
                        disabled={loading}
                        sx={{
                            borderRadius: 50,
                            px: 3,
                            borderColor: theme.palette.primary.main,
                            color: theme.palette.primary.main,
                            '&:hover': {
                                borderColor: theme.palette.primary.dark,
                                backgroundColor: alpha(theme.palette.primary.main, 0.04),
                            }
                        }}
                    >
                        {t('adminReviewManagement.refresh')}
                    </Button>
                </Box>
            </Box>

            {/* Controls */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: { xs: 2, sm: 0 },
                    mb: 3,
                    pb: 2,
                }}
            >
                {/* Filter Toggle Buttons */}
                <ToggleButtonGroup
                    value={filter}
                    exclusive
                    onChange={handleFilterChange}
                    aria-label="filter reviews"
                    sx={{
                        ".MuiToggleButton-root": {
                            border: "none",
                            borderRadius: "50px !important",
                            mx: 0.5,
                            px: 2,
                            py: 1,
                            transition: "all 0.2s ease",
                            fontWeight: 500,
                            color: theme.palette.text.primary,
                        },
                        ".MuiToggleButton-root.Mui-selected": {
                            backgroundColor: theme.palette.primary.main,
                            color: "white",
                            "&:hover": {
                                backgroundColor: theme.palette.primary.dark,
                            },
                        },
                    }}
                >
                    <ToggleButton value="all" aria-label="all reviews">
                        {t('adminReviewManagement.allReviews')}
                    </ToggleButton>
                    <ToggleButton value="with_replies" aria-label="reviews with replies">
                        {t('adminReviewManagement.withReplies')}
                    </ToggleButton>
                </ToggleButtonGroup>

                {/* Sort Chip and Menu */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                        icon={<SortIcon />}
                        label={getSortLabel()}
                        onClick={handleSortMenuOpen}
                        deleteIcon={<KeyboardArrowDownIcon />}
                        onDelete={handleSortMenuOpen}
                        sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            borderRadius: 50,
                            fontWeight: 500,
                            px: 1,
                            "&:hover": {
                                bgcolor: alpha(theme.palette.primary.main, 0.2),
                            },
                            transition: "all 0.2s ease",
                        }}
                    />
                    <Menu
                        anchorEl={anchorEl}
                        open={sortMenuOpen}
                        onClose={handleSortMenuClose}
                        anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                        }}
                        transformOrigin={{
                            vertical: "top",
                            horizontal: "right",
                        }}
                        PaperProps={{
                            elevation: 3,
                            sx: {
                                mt: 1,
                                borderRadius: 2,
                                minWidth: 180,
                            },
                        }}
                    >
                        <MenuItem
                            onClick={() => handleSortChange("recent")}
                            selected={sortOrder === "recent"}
                            sx={{
                                py: 1.5,
                                borderLeft:
                                    sortOrder === "recent"
                                        ? `4px solid ${theme.palette.primary.main}`
                                        : "4px solid transparent",
                                fontWeight: sortOrder === "recent" ? 600 : 400,
                            }}
                        >
                            {t('adminReviewManagement.mostRecent')}
                        </MenuItem>
                        <MenuItem
                            onClick={() => handleSortChange("oldest")}
                            selected={sortOrder === "oldest"}
                            sx={{
                                py: 1.5,
                                borderLeft:
                                    sortOrder === "oldest"
                                        ? `4px solid ${theme.palette.primary.main}`
                                        : "4px solid transparent",
                                fontWeight: sortOrder === "oldest" ? 600 : 400,
                            }}
                        >
                            {t('adminReviewManagement.oldestFirst')}
                        </MenuItem>
                    </Menu>
                </Box>
            </Box>

            {/* Loading State */}
            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                    <Loading />
                </Box>
            )}

            {/* Error State */}
            {error && (
                <Paper
                    sx={{
                        p: 5,
                        textAlign: "center",
                        borderRadius: 4,
                        backgroundColor: "background.paper",
                    }}
                >
                    <Typography variant="h6" mb={2} fontWeight={600} color="error">
                        {t('adminReviewManagement.errorLoading')}
                    </Typography>
                    <Typography color="text.secondary">{error}</Typography>
                    <Button
                        onClick={fetchReviews}
                        sx={{ mt: 2 }}
                        variant="outlined"
                    >
                        {t('adminReviewManagement.tryAgain')}
                    </Button>
                </Paper>
            )}

            {/* Empty State */}
            {!loading && !error && sortedReviews.length === 0 ? (
                <Paper
                    sx={{
                        p: 5,
                        textAlign: "center",
                        borderRadius: 4,
                        backgroundColor: "background.paper",
                    }}
                >
                    <Box
                        component="img"
                        src="https://cdn-icons-png.flaticon.com/512/6194/6194008.png"
                        alt="No Reviews"
                        sx={{ width: 100, height: 100, mb: 3, opacity: 0.7 }}
                    />
                    <Typography variant="h6" mb={2} fontWeight={600}>
                        {t('adminReviewManagement.noReviewsFound')}
                    </Typography>
                    <Typography color="text.secondary">
                        {filter === "with_replies"
                            ? t('adminReviewManagement.noRepliesFound')
                            : t('adminReviewManagement.noReviewsInSystem')}
                    </Typography>
                </Paper>
            ) : (
                /* Reviews List */
                !loading &&
                !error && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        {sortedReviews.map((review) => {
                            return (
                                <Card
                                    key={review.id || review.orderGroupId}
                                    sx={{
                                        borderRadius: 4,
                                        overflow: "hidden",
                                        backgroundColor: "background.paper",
                                        transition: "transform 0.2s ease",
                                        "&:hover": {
                                            transform: "translateY(-4px)",
                                        },
                                    }}
                                >
                                    <Box sx={{ p: 3 }}>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: { xs: "flex-start", sm: "center" },
                                                flexDirection: { xs: "column", sm: "row" },
                                                gap: { xs: 2, sm: 0 },
                                                mb: 3,
                                            }}
                                        >
                                            <Box
                                                sx={{ display: "flex", alignItems: "center", gap: 2 }}
                                            >
                                                <Avatar
                                                    src={review.userAvatar}
                                                    alt={review.userName}
                                                    sx={{
                                                        width: 56,
                                                        height: 56,
                                                        border: "2px solid",
                                                        borderColor: theme.palette.primary.main,
                                                    }}
                                                >
                                                    <PersonIcon />
                                                </Avatar>
                                                <Box>
                                                    <Typography
                                                        variant="subtitle1"
                                                        fontWeight={700}
                                                        sx={{ mb: 0.5 }}
                                                    >
                                                        {review.userName}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                                        <Chip
                                                            icon={<RestaurantIcon sx={{ fontSize: 16 }} />}
                                                            label={t('adminReviewManagement.orderNumber', { orderGroupId: review.orderGroupId })}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                                color: theme.palette.primary.main,
                                                                fontWeight: 500,
                                                                height: 24,
                                                                borderRadius: 50,
                                                                "& .MuiChip-label": { px: 1 },
                                                            }}
                                                        />
                                                        <Chip
                                                            icon={<AccessTimeIcon sx={{ fontSize: 16 }} />}
                                                            size="small"
                                                            label={formatDate(review.reviewDate)}
                                                            sx={{
                                                                backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                                                                color: theme.palette.secondary.main,
                                                                fontWeight: 500,
                                                                height: 24,
                                                                borderRadius: 50,
                                                                "& .MuiChip-label": { px: 1 },
                                                            }}
                                                        />
                                                    </Box>
                                                </Box>
                                            </Box>

                                            {/* Action Buttons */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {review.restaurantReply && review.restaurantReply.trim() !== '' && (
                                                    <Tooltip title={t('adminReviewManagement.deleteReply')}>
                                                        <IconButton
                                                            onClick={() => handleDeleteReplyClick(review)}
                                                            sx={{
                                                                color: theme.palette.warning.main,
                                                                bgcolor: alpha(theme.palette.warning.main, 0.1),
                                                                '&:hover': {
                                                                    bgcolor: alpha(theme.palette.warning.main, 0.2),
                                                                },
                                                            }}
                                                        >
                                                            <CloseIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                <Tooltip title={t('adminReviewManagement.deleteReview')}>
                                                    <IconButton
                                                        onClick={() => handleDeleteClick(review)}
                                                        sx={{
                                                            color: theme.palette.error.main,
                                                            bgcolor: alpha(theme.palette.error.main, 0.1),
                                                            '&:hover': {
                                                                bgcolor: alpha(theme.palette.error.main, 0.2),
                                                            },
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Box>

                                        {/* Review Content */}
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 2.5,
                                                mb: 3,
                                                borderRadius: 3,
                                                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                                borderLeft: "4px solid",
                                                borderColor: theme.palette.primary.main,
                                            }}
                                        >
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    fontStyle: "italic",
                                                    color: "text.primary",
                                                    lineHeight: 1.6,
                                                }}
                                            >
                                                "{review.review}"
                                            </Typography>
                                        </Paper>

                                        {/* Restaurant Reply */}
                                        {review.restaurantReply && review.restaurantReply.trim() !== '' && (
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p: 2.5,
                                                    mb: 3,
                                                    borderRadius: 3,
                                                    backgroundColor: alpha(theme.palette.success.main, 0.1),
                                                    borderLeft: "4px solid",
                                                    borderColor: theme.palette.success.main,
                                                }}
                                            >
                                                <Typography
                                                    variant="subtitle2"
                                                    fontWeight={700}
                                                    mb={1}
                                                    color="success.main"
                                                >
                                                    {t('adminReviewManagement.restaurantReply')}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    color="text.primary"
                                                    sx={{ lineHeight: 1.6 }}
                                                >
                                                    {review.restaurantReply}
                                                </Typography>
                                            </Paper>
                                        )}
                                    </Box>
                                </Card>
                            );
                        })}
                    </Box>
                )
            )}

            {/* Delete Review Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={closeDeleteDialog}
                fullWidth
                maxWidth="sm"
                fullScreen={isMobile}
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        backgroundColor: "background.paper",
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        py: 3,
                        px: 3,
                        fontWeight: 700,
                    }}
                >
                    {t('adminReviewManagement.deleteReviewTitle')}
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Typography variant="body1">
                        {t('adminReviewManagement.deleteReviewMessage', { userName: selectedReview?.userName })}
                    </Typography>
                </DialogContent>
                <DialogActions
                    sx={{
                        p: 3,
                        flexDirection: isMobile ? "column" : "row",
                        alignItems: isMobile ? "stretch" : "center",
                        gap: isMobile ? 2 : 1,
                    }}
                >
                    <Button
                        onClick={closeDeleteDialog}
                        sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            color: "text.secondary",
                            borderRadius: 50,
                            px: 3,
                            order: isMobile ? 1 : 1,
                        }}
                    >
                        {t('adminReviewManagement.cancel')}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleDeleteReview}
                        disabled={deleteLoading}
                        sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            borderRadius: 50,
                            px: 3,
                            background: theme.palette.error.main,
                            "&:hover": {
                                background: theme.palette.error.dark,
                            },
                            transition: "all 0.2s ease",
                            order: isMobile ? 2 : 2,
                        }}
                    >
                        {deleteLoading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            t('adminReviewManagement.deleteReviewBtn')
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Reply Dialog */}
            <Dialog
                open={deleteReplyDialogOpen}
                onClose={closeDeleteReplyDialog}
                fullWidth
                maxWidth="sm"
                fullScreen={isMobile}
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        backgroundColor: "background.paper",
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        py: 3,
                        px: 3,
                        fontWeight: 700,
                    }}
                >
                    {t('adminReviewManagement.deleteReplyTitle')}
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Typography variant="body1">
                        {t('adminReviewManagement.deleteReplyMessage', { userName: selectedReplyReview?.userName })}
                    </Typography>
                </DialogContent>
                <DialogActions
                    sx={{
                        p: 3,
                        flexDirection: isMobile ? "column" : "row",
                        alignItems: isMobile ? "stretch" : "center",
                        gap: isMobile ? 2 : 1,
                    }}
                >
                    <Button
                        onClick={closeDeleteReplyDialog}
                        sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            color: "text.secondary",
                            borderRadius: 50,
                            px: 3,
                            order: isMobile ? 1 : 1,
                        }}
                    >
                        {t('adminReviewManagement.cancel')}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleDeleteRestaurantReply}
                        disabled={deleteReplyLoading}
                        sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            borderRadius: 50,
                            px: 3,
                            background: theme.palette.error.main,
                            "&:hover": {
                                background: theme.palette.error.dark,
                            },
                            transition: "all 0.2s ease",
                            order: isMobile ? 2 : 2,
                        }}
                    >
                        {deleteReplyLoading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            t('adminReviewManagement.deleteReplyBtn')
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Success Snackbar */}
            <Snackbar
                open={!!successMessage}
                autoHideDuration={6000}
                onClose={() => setSuccessMessage(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSuccessMessage(null)}
                    severity="success"
                    variant='filled'
                    sx={{ width: '100%' }}
                >
                    {successMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminReviewManagementPage;