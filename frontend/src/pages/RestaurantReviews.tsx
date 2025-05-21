import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  Avatar,
  Chip,
  Paper,
  IconButton,
  Rating,
  TextField,
  InputAdornment,
  Button,
  useTheme,
  useMediaQuery,
  alpha,
  Divider,
  CircularProgress,
  Skeleton,
  Menu,
  MenuItem,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
// Import icons
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Sort as SortIcon,
  AccessTime as AccessTimeIcon,
  StarOutline as StarOutlineIcon,
  ShoppingBagOutlined as ShoppingBagOutlinedIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Search as SearchIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from "@mui/icons-material";

import {
  getRestaurantDetails,
  getRestaurantReviewsForCustomer,
  checkIsFavorite,
  addToFavorites,
  removeFromFavorites
} from "../utils/api";
import { RemovableElementDTO } from "../types";
import { getToken } from "../utils/auth";

// Updated interfaces to match backend DTOs
interface ReviewDTO {
  tasteRating: number;
  deliveryRating: number;
  serviceRating: number;
  review: string;
  restaurantAnswer?: string | null;
  userName: string;
  userAvatar: string;
  reviewDate: string;
  orderGroupId: number;
  orderItems?: {
    name: string;
    menuItemId: number;
    quantity: number;
    price: number;
    removables: RemovableElementDTO[]; 
  }[];
}

const RestaurantReviewsCustomerView = ({ restaurantId = 1 }) => {
  const { id } = useParams(); // Note: use "id" to match your route parameter name
  const parsedRestaurantId = id ? parseInt(id) : 1;
  const isAuthenticated = !!getToken();
  const { t, i18n } = useTranslation();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"recent" | "oldest" | "highest" | "lowest">("recent");
  const [isFavorite, setIsFavorite] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [restaurantLoading, setRestaurantLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [actualRestaurantId, setActualRestaurantId] = useState<number>(parsedRestaurantId);
  
  // For sort menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const sortMenuOpen = Boolean(anchorEl);

  // Restaurant info from backend
  const [restaurant, setRestaurant] = useState<{
    id: number;
    restaurantName: string;
    rating: number;
    reviews: number;
    minOrder: string;
    deliveryTime: string;
    description: string;
    profileImg: string;
  }>({
    id: restaurantId,
    restaurantName: "",
    rating: 0,
    reviews: 0,
    minOrder: "250₺",
    deliveryTime: "20-25 Min",
    description: "",
    profileImg: "/api/placeholder/300/240",
  });

  // Items per page
  const ITEMS_PER_PAGE = 5;

  // Fetch restaurant details and reviews
  useEffect(() => {
    const fetchRestaurantData = async () => {
      setRestaurantLoading(true);
      try {
        const restaurantData = await getRestaurantDetails(parsedRestaurantId);
        console.log("Restaurant data:", restaurantData);
        
        if (restaurantData) {
          setRestaurant({
            id: restaurantData.id || parsedRestaurantId,
            restaurantName: restaurantData.restaurantName || "",
            rating: restaurantData.rating || 0,
            reviews: restaurantData.reviews || 0,
            minOrder: "250₺",
            deliveryTime: "20-25 Min",
            description: "",
            profileImg: restaurantData.profileImg || "/api/placeholder/300/240",
          });
          setActualRestaurantId(restaurantData.id || parsedRestaurantId);
        }
      } catch (err: unknown) {
        // Type the error properly
        console.error("Error fetching restaurant details:", err);
      } finally {
        setRestaurantLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await getRestaurantReviewsForCustomer(parsedRestaurantId);
        console.log("Reviews data:", response);
        setReviews(response);
        setError(null);
      } catch (err: unknown) {
        console.error("Error fetching reviews:", err);
        // Safely extract error message
        if (err instanceof Error) {
          setError(err.message || t('restaurantReviews.failedToLoad'));
        } else {
          setError(t('restaurantReviews.failedToLoad'));
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchRestaurantData();
    fetchReviews();
  }, [parsedRestaurantId, t]); 

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const status = await checkIsFavorite(parsedRestaurantId);
        setIsFavorite(status);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };
    
    checkFavoriteStatus();
  }, [parsedRestaurantId]);

  // Calculate overall rating for a review
  const calculateOverallRating = (review: ReviewDTO): number => {
    return (
      (review.tasteRating + review.deliveryRating + review.serviceRating) / 3
    );
  };

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(reviews.length / ITEMS_PER_PAGE));

  // Handle page change
  const handlePageChange = (direction: "prev" | "next" | number) => {
    if (direction === "prev" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (direction === "next" && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (typeof direction === "number") {
      setCurrentPage(direction);
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
    sortType: "recent" | "oldest" | "highest" | "lowest"
  ) => {
    setSortOrder(sortType);
    setAnchorEl(null); // Close the menu
    // Reset to first page when sorting changes
    setCurrentPage(1);
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await removeFromFavorites(parsedRestaurantId);
      } else {
        await addToFavorites(parsedRestaurantId);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite status:', error);
    }
  };
  
  // Format date string to locale date
  const formatDate = (dateValue: any): string => {
    try {
      // Get current locale from i18n
      const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US';

      // Check if the date is an array
      if (Array.isArray(dateValue)) {
        // If it's an array like [2025, 5, 17, 23, 5, 3, 222093000]
        const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
        // JavaScript months are 0-indexed, but your array seems to use 1-indexed months
        const date = new Date(year, month - 1, day, hour, minute, second);
        
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString(locale, {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        }
      } else if (typeof dateValue === "string") {
        // Handle string date format
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString(locale, {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        }
      }
      
      // If we couldn't parse it or it's an unknown format
      console.warn("Could not parse date:", dateValue);
      return t('restaurantReviews.unknownDate');
    } catch (error) {
      console.error("Error parsing date:", error);
      return t('restaurantReviews.unknownDate');
    }
  };

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Helper function to get a color based on rating - adapted for dark mode compatibility
  const getRatingColor = (rating: number): string => {
    // These colors work well in both light and dark mode
    if (rating >= 4.5) return "#4CAF50"; // Excellent - green
    if (rating >= 3.5) return "#8BC34A"; // Good - light green
    if (rating >= 2.5) return "#FFC107"; // Average - amber
    if (rating >= 1.5) return "#FF9800"; // Below average - orange
    return "#F44336"; // Poor - red
  };

  // Filter reviews based on search term
  const filteredReviews = reviews.filter(
    (review) =>
      searchTerm === "" ||
      review.review.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort reviews based on current sort order
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    // For rating-based sorting
    if (sortOrder === "highest" || sortOrder === "lowest") {
      const ratingA = calculateOverallRating(a);
      const ratingB = calculateOverallRating(b);

      return sortOrder === "highest"
        ? ratingB - ratingA // Highest first
        : ratingA - ratingB; // Lowest first
    }

    // For date-based sorting
    // Parse dates safely
    const getTimestamp = (dateValue: any): number => {
      // Check if the date is an array (as in your case)
      if (Array.isArray(dateValue)) {
        // If it's an array like [2025, 5, 17, 23, 5, 3, 222093000]
        // Create a date from the year, month (0-indexed), day, hour, minute, second
        const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
        // JavaScript months are 0-indexed, but your array seems to use 1-indexed months
        const date = new Date(year, month - 1, day, hour, minute, second);
        return date.getTime();
      } else if (typeof dateValue === "string") {
        // If it's a string, try to parse it
        const date = new Date(dateValue);
        return isNaN(date.getTime()) ? 0 : date.getTime();
      }
      // Default case, return 0 (oldest)
      return 0;
    };

    const dateA = getTimestamp(a.reviewDate);
    const dateB = getTimestamp(b.reviewDate);

    return sortOrder === "recent" ? dateB - dateA : dateA - dateB;
  });

  // Get reviews for current page
  const paginatedReviews = sortedReviews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Generate page numbers for pagination
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // Generate star rating display
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const remainder = rating - fullStars;

    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          color: "#FFB400", // Gold star color works in both light/dark mode
          my: 0.5,
          fontSize: { xs: "0.8rem", md: "1rem" },
        }}
      >
        {[...Array(5)].map((_, i) => (
          <Box
            component="span"
            key={i}
            sx={{
              color:
                i < fullStars
                  ? "#FFB400"
                  : i === fullStars && remainder >= 0.5
                  ? "#FFB400"
                  : theme.palette.mode === 'light' ? "#E0E0E0" : "#555555",
            }}
          >
            ★
          </Box>
        ))}
      </Box>
    );
  };

  // Get sort label based on current sort order
  const getSortLabel = () => {
    switch (sortOrder) {
      case "recent":
        return t('restaurantReviews.sortOptions.recent');
      case "oldest":
        return t('restaurantReviews.sortOptions.oldest');
      case "highest":
        return t('restaurantReviews.sortOptions.highest');
      case "lowest":
        return t('restaurantReviews.sortOptions.lowest');
      default:
        return t('restaurantReviews.sortOptions.sort');
    }
  };

  // Order Items Display Component
  const OrderItemsList: React.FC<{ orderItems?: ReviewDTO['orderItems'] }> = ({
    orderItems,
  }) => {
    if (!orderItems || orderItems.length === 0) {
      return null;
    }

    return (
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          backgroundColor: (theme) =>
            alpha(theme.palette.background.paper, 0.5),
          borderLeft: "4px solid",
          borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <ShoppingBagOutlinedIcon
            fontSize="small"
            sx={{ mr: 1, color: (theme) => theme.palette.text.secondary }}
          />
          <Typography variant="subtitle2" fontWeight={600}>
            {t('restaurantReviews.orderDetails')}
          </Typography>
        </Box>
        
        {/* Dikey olarak gösterilen sipariş öğeleri */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {orderItems.map((item, index) => (
            <Box 
              key={`${item.menuItemId}-${index}`}
              sx={{ 
                display: "flex", 
                alignItems: "center",
                p: 1,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.primary.light, 0.05),
              }}
            >
              <Typography sx={{ fontWeight: 500 }}>
                {item.name} 
              </Typography>
              <Typography 
                sx={{ 
                  ml: 'auto', 
                  color: (theme) => theme.palette.text.secondary,
                  fontSize: '0.9rem'
                }}
              >
                {item.quantity} x {item.price.toFixed(2)}₺
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    );
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Restaurant Banner */}
      <Paper
        sx={{
          borderRadius: { xs: 2, sm: 3, md: 4 },
          overflow: "hidden",
          mb: { xs: 2, sm: 3, md: 4 },
          background: "linear-gradient(135deg, #845EC2 0%, #FF5E78 50%, #FEAC5E 100%)",
          color: "white",
          position: "relative",
          p: { xs: 2, sm: 3 },
          minHeight: { xs: 280, md: 240 },
        }}
      >
        {/* Favorite Button */}
       {isAuthenticated && <IconButton
          onClick={toggleFavorite}
          aria-label={isFavorite ? t('restaurant.removeFromFavorites') : t('restaurant.addToFavorites')}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            bgcolor: isFavorite ? theme.palette.secondary.main : "rgba(255,255,255,0.9)",
            color: isFavorite ? "white" : theme.palette.secondary.main,
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            zIndex: 2,
            transition: "all 0.3s ease",
            width: 48,
            height: 48,
            "&:hover": {
              bgcolor: isFavorite ? theme.palette.secondary.dark : "white",
              transform: "scale(1.1)",
            },
          }}
        >
          {isFavorite ? (
            <FavoriteIcon fontSize="medium" />
          ) : (
            <FavoriteBorderIcon fontSize="medium" />
          )}
        </IconButton>}

        <Box
          sx={{
            p: { xs: 1, sm: 2, md: 3 },
            position: "relative",
            zIndex: 1,
            mt: { xs: 3, sm: 4, md: 5 },
            width: { xs: "100%", md: "55%" },
          }}
        >
          <Box sx={{ mb: { xs: 3, sm: 4, md: 6 } }}>
            {restaurantLoading ? (
              <Skeleton
                variant="text"
                width="70%"
                height={isMobile ? 40 : isTablet ? 50 : 60}
                sx={{ mb: { xs: 1, sm: 2 } }}
              />
            ) : (
              <Typography
                variant={isMobile ? "h4" : isTablet ? "h3" : "h2"}
                component="h1"
                fontWeight="bold"
                sx={{ mb: { xs: 1, sm: 2 } }}
              >
                {restaurant.restaurantName}
              </Typography>
            )}

            {restaurant.description && (
              <Typography variant="subtitle1" sx={{ mb: 2, opacity: 0.9 }}>
                {restaurant.description}
              </Typography>
            )}

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "flex-start", sm: "center" },
                gap: { xs: 1, sm: 2 },
                mt: 2,
              }}
            >
              {restaurantLoading ? (
                <>
                  <Skeleton
                    variant="rectangular"
                    width={120}
                    height={32}
                    sx={{
                      borderRadius: 50,
                      mb: { xs: 1, sm: 0 },
                    }}
                  />
                  <Skeleton
                    variant="rectangular"
                    width={150}
                    height={32}
                    sx={{
                      borderRadius: 50,
                    }}
                  />
                </>
              ) : (
                <>
                  <Box
                    sx={{
                      borderRadius: 50,
                      border: "1px solid rgba(255,255,255,0.6)",
                      display: "flex",
                      alignItems: "center",
                      px: { xs: 1.5, sm: 2 },
                      py: 0.5,
                    }}
                  >
                    <Box sx={{ mr: 1, display: "flex" }}>₺</Box>
                    <Typography variant={isMobile ? "caption" : "body2"}>
                      {t('restaurant.min')}: {restaurant.minOrder}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      borderRadius: 50,
                      border: "1px solid rgba(255,255,255,0.6)",
                      display: "flex",
                      alignItems: "center",
                      px: { xs: 1.5, sm: 2 },
                      py: 0.5,
                    }}
                  >
                    <Box sx={{ mr: 1, display: "flex" }}>🕒</Box>
                    <Typography variant={isMobile ? "caption" : "body2"}>
                      {t('restaurant.delivery', { min: restaurant.deliveryTime.split('-')[0], max: restaurant.deliveryTime.split('-')[1] })}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </Box>

        {/* Image and Rating */}
        <Box
          sx={{
            position: { xs: "relative", md: "absolute" },
            right: { md: 24 },
            top: { md: "50%" },
            transform: { md: "translateY(-50%)" },
            width: { xs: "100%", sm: "60%", md: "40%" },
            height: { xs: 160, sm: 180, md: "80%" },
            mx: { xs: "auto", md: 0 },
            mt: { xs: 2, md: 0 },
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              borderRadius: { xs: 2, sm: 3, md: 4 },
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            {restaurantLoading ? (
              <Skeleton
                variant="rectangular"
                width="100%"
                height="100%"
                animation="wave"
              />
            ) : (
              <Box
                component="img"
                src={restaurant.profileImg}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                alt={restaurant.restaurantName || t('restaurantReviews.restaurantImage')}
              />
            )}
          </Box>

          {/* Rating Box - Bottom left of the image */}
          <Box
            sx={{
              position: "absolute",
              left: { xs: "auto", md: -40 },
              right: { xs: -8, md: "auto" },
              bottom: { xs: -8, md: -20 },
              bgcolor: "background.default",
              borderRadius: { xs: 2, md: 3 },
              width: { xs: 100, sm: 110, md: 125 },
              p: { xs: 0.5, sm: 1 },
              textAlign: "center",
              boxShadow: '0px 0px 10px rgba(132, 94, 194, 0.3)',
            }}
          >
            {restaurantLoading ? (
              <>
                <Skeleton
                  variant="text"
                  width="60%"
                  height={isMobile ? 30 : 40}
                  sx={{ mx: "auto" }}
                />
                <Skeleton
                  variant="text"
                  width="80%"
                  height={20}
                  sx={{ mx: "auto", my: 0.5 }}
                />
                <Skeleton
                  variant="text"
                  width="90%"
                  height={16}
                  sx={{ mx: "auto", mb: 0.5 }}
                />
                <Skeleton
                  variant="text"
                  width="70%"
                  height={16}
                  sx={{ mx: "auto" }}
                />
              </>
            ) : (
              <>
                <Typography
                  variant={isMobile ? "h5" : "h4"}
                  fontWeight="bold"
                  color="text.primary"
                >
                  {restaurant.rating.toFixed(1)}
                </Typography>
                {renderStars(restaurant.rating)}
                <Typography
                  variant={isMobile ? "caption" : "body2"}
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  {restaurant.reviews} {t('restaurant.review')}
                </Typography>
              </>
            )}
          </Box>
        </Box>

        {/* View Menu Chip - Now with navigation functionality */}
        <Box
          sx={{
            position: "absolute",
            bottom: 16,
            left: "46%",
            transform: "translateX(-50%)",
            zIndex: 1,
            backgroundColor: 'primary.light',
            borderRadius: 50,
            padding: "6px 16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            "&:hover": {
              backgroundColor: 'primary.light',
            },
          }}
        >
          <Typography
            variant={isMobile ? "caption" : "body2"}
            onClick={() => navigate(`/restaurants/${actualRestaurantId}`)}
            sx={{
              color: theme.palette.primary.main,
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.875rem" },
              cursor: "pointer",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            {t('restaurantReviews.viewMenu')}{" "}
            <Box component="span" sx={{ ml: 0.5 }}>
              ›
            </Box>
          </Typography>
        </Box>
      </Paper>

      {/* Search Bar */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder={t('restaurantReviews.searchPlaceholder')}
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            sx: {
              borderRadius: 6,
              bgcolor: 'primary.light',
            },
          }}
        />
      </Box>

      {/* Reviews Section */}
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              background: theme.palette.primary.main,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              display: "inline-block",
            }}
          >
            {t('restaurantReviews.title')}
          </Typography>
          
          <Chip
            icon={<StarOutlineIcon />}
            label={t('restaurantReviews.reviewCount', { count: reviews.length })}
            sx={{
              fontWeight: 600,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              borderRadius: 50,
              px: 1,
            }}
          />
        </Box>
        
        {/* Updated Sort Section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mb: 3,
          }}
        >
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

          {/* Sort Menu */}
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
              {t('restaurantReviews.sortOptions.recent')}
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
              {t('restaurantReviews.sortOptions.oldest')}
            </MenuItem>
            <MenuItem
              onClick={() => handleSortChange("highest")}
              selected={sortOrder === "highest"}
              sx={{
                py: 1.5,
                borderLeft:
                  sortOrder === "highest"
                    ? `4px solid ${theme.palette.primary.main}`
                    : "4px solid transparent",fontWeight: sortOrder === "highest" ? 600 : 400,
              }}
            >
              {t('restaurantReviews.sortOptions.highest')}
            </MenuItem>
            <MenuItem
              onClick={() => handleSortChange("lowest")}
              selected={sortOrder === "lowest"}
              sx={{
                py: 1.5,
                borderLeft:
                  sortOrder === "lowest"
                    ? `4px solid ${theme.palette.primary.main}`
                    : "4px solid transparent",
                fontWeight: sortOrder === "lowest" ? 600 : 400,
              }}
            >
              {t('restaurantReviews.sortOptions.lowest')}
            </MenuItem>
          </Menu>
        </Box>

        {/* Loading state */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress color="primary" />
          </Box>
        )}

        {/* Error state */}
        {error && (
          <Paper
            sx={{
              p: 5,
              textAlign: "center",
              borderRadius: 4,
              boxShadow: '0px 0px 10px rgba(132, 94, 194, 0.3)',
              backgroundColor: "white",
            }}
          >
            <Typography variant="h6" mb={2} fontWeight={600} color="error">
              {t('restaurantReviews.errorLoading')}
            </Typography>
            <Typography color="text.secondary">{error}</Typography>
            <Button
              onClick={() => window.location.reload()}
              sx={{ mt: 2 }}
              variant="outlined"
            >
              {t('restaurantReviews.tryAgain')}
            </Button>
          </Paper>
        )}

        {/* Empty state */}
        {!loading && !error && reviews.length === 0 && (
          <Paper
            sx={{
              p: 5,
              textAlign: "center",
              borderRadius: 4,
              boxShadow: '0px 0px 10px rgba(132, 94, 194, 0.3)',
              backgroundColor: "white",
            }}
          >
            <Box
              component="img"
              src="https://cdn-icons-png.flaticon.com/512/6194/6194008.png"
              alt={t('restaurantReviews.noReviews')}
              sx={{ width: 100, height: 100, mb: 3, opacity: 0.7 }}
            />
            <Typography variant="h6" mb={2} fontWeight={600}>
              {t('restaurantReviews.noReviews')}
            </Typography>
            <Typography color="text.secondary">
              {t('restaurantReviews.beFirst')}
            </Typography>
          </Paper>
        )}

        {/* Reviews */}
        {!loading && !error && reviews.length > 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {paginatedReviews.map((review) => {
              const overallRating = calculateOverallRating(review);

              return (
                <Card
                  key={review.orderGroupId}
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
                          src={
                            review.userAvatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              review.userName
                            )}`
                          }
                          alt={review.userName}
                          sx={{
                            width: 56,
                            height: 56,
                            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                            border: "2px solid white",
                          }}
                        />
                        <Box>
                          <Typography
                            variant="subtitle1"
                            fontWeight={700}
                            sx={{ mb: 0.5 }}
                          >
                            {review.userName}
                          </Typography>
                          <Chip
                            icon={<StarOutlineIcon sx={{ fontSize: 16 }} />}
                            label={overallRating.toFixed(1)}
                            size="small"
                            sx={{
                              backgroundColor: alpha(
                                getRatingColor(overallRating),
                                0.1
                              ),
                              color: getRatingColor(overallRating),
                              fontWeight: 700,
                              mr: 1,
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
                              backgroundColor: alpha(
                                theme.palette.primary.main,
                                0.1
                              ),
                              color: theme.palette.primary.main,
                              fontWeight: 500,
                              height: 24,
                              borderRadius: 50,
                              "& .MuiChip-label": { px: 1 },
                            }}
                          />
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
                          p: 1.5,
                          borderRadius: 2,
                          backgroundColor: alpha(
                            theme.palette.primary.light,
                            0.1
                          ),
                          width: { xs: "100%", sm: "auto" },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              width: 60,
                              color: theme.palette.text.secondary,
                              fontWeight: 500,
                            }}
                          >
                            {t('restaurantReviews.ratings.taste')}:
                          </Typography>
                          <Rating
                            value={review.tasteRating}
                            readOnly
                            precision={0.5}
                            size="small"
                            sx={{
                              "& .MuiRating-iconFilled": {
                                color: getRatingColor(review.tasteRating),
                              },
                            }}
                          />
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              width: 60,
                              color: theme.palette.text.secondary,
                              fontWeight: 500,
                            }}
                          >
                            {t('restaurantReviews.ratings.service')}:
                          </Typography>
                          <Rating
                            value={review.serviceRating}
                            readOnly
                            precision={0.5}
                            size="small"
                            sx={{
                              "& .MuiRating-iconFilled": {
                                color: getRatingColor(review.serviceRating),
                              },
                            }}
                          />
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              width: 60,
                              color: theme.palette.text.secondary,
                              fontWeight: 500,
                            }}
                          >
                            {t('restaurantReviews.ratings.delivery')}:
                          </Typography>
                          <Rating
                            value={review.deliveryRating}
                            readOnly
                            precision={0.5}
                            size="small"
                            sx={{
                              "& .MuiRating-iconFilled": {
                                color: getRatingColor(review.deliveryRating),
                              },
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                    <OrderItemsList orderItems={review.orderItems} />

                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        mb: 3,
                        borderRadius: 3,
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.04
                        ),
                        borderLeft: "4px solid",
                        borderColor: theme.palette.primary.main,
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          fontStyle: "italic",
                          color: theme.palette.text.primary,
                          lineHeight: 1.6,
                        }}
                      >
                        "{review.review}"
                      </Typography>
                    </Paper>

                    {review.restaurantAnswer && (
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          borderRadius: 3,
                          backgroundColor: alpha(
                            theme.palette.primary.light,
                            0.1
                          ),
                          borderLeft: "4px solid",
                          borderColor: theme.palette.primary.main,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                          mb={1}
                          color="primary"
                        >
                          {t('restaurantReviews.restaurantReply')}
                        </Typography>
                        <Typography
                          variant="body2"
                          color={theme.palette.text.primary}
                          sx={{ lineHeight: 1.6 }}
                        >
                          {review.restaurantAnswer}
                        </Typography>
                      </Paper>
                    )}
                  </Box>
                </Card>
              );
            })}
          </Box>
        )}

        {/* Pagination - only show if we have reviews and more than 1 page */}
        {!loading && !error && reviews.length > 0 && totalPages > 1 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mt: 4,
              mb: 2,
              gap: 1,
            }}
          >
            <IconButton
              onClick={() => handlePageChange("prev")}
              disabled={currentPage === 1}
              sx={{
                color: theme.palette.primary.main,
                "&.Mui-disabled": {
                  color: alpha(theme.palette.primary.main, 0.3),
                },
              }}
            >
              <ChevronLeftIcon />
            </IconButton>

            {pageNumbers.map((page) => (
              <Chip
                key={page}
                label={page}
                onClick={() => handlePageChange(page)}
                sx={{
                  fontWeight: "bold",
                  bgcolor:
                    page === currentPage
                      ? theme.palette.primary.main
                      : alpha(theme.palette.primary.main, 0.1),
                  color:
                    page === currentPage
                      ? "white"
                      : theme.palette.primary.main,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor:
                      page === currentPage
                        ? theme.palette.primary.main
                        : alpha(theme.palette.primary.main, 0.2),
                  },
                }}
              />
            ))}

            <IconButton
              onClick={() => handlePageChange("next")}
              disabled={currentPage === totalPages}
              sx={{
                color: theme.palette.primary.main,
                "&.Mui-disabled": {
                  color: alpha(theme.palette.primary.main, 0.3),
                },
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default RestaurantReviewsCustomerView;