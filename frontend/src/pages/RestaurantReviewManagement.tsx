import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Divider,
  Card,
  Avatar,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Rating,
  alpha,
  useMediaQuery,
  useTheme,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Menu,
  MenuItem,
} from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SortIcon from "@mui/icons-material/Sort";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { getRestaurantReviews, replyToReview } from "../utils/api";

// Interfaces
interface OrderItem {
  name: string;
  menuItemId: number;
  quantity: number;
  price: number;
  removables: string | null;
}

interface Review {
  tasteRating: number;
  deliveryRating: number;
  serviceRating: number;
  review: string;
  restaurantAnswer?: string | null;
  userName: string;
  userAvatar: string;
  reviewDate: string;
  orderGroupId: number;
  isReplied: boolean;
  orderItems?: OrderItem[];
}

const RestaurantReviewManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<"all" | "unresponded">("all");
  const [replyDialogOpen, setReplyDialogOpen] = useState<boolean>(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"recent" | "oldest" | "highest" | "lowest">("recent");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const sortMenuOpen = Boolean(anchorEl);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const data = await getRestaurantReviews();
        const reviewsWithIsReplied = data.map((review) => ({
          ...review,
          isReplied: Boolean(review.restaurantAnswer),
        }));
        setReviews(reviewsWithIsReplied);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching reviews:", err);
        setError(err.message || "Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // Filter handler
  const handleFilterChange = (
    _event: React.MouseEvent<HTMLElement>,
    newFilter: "all" | "unresponded" | null
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
    sortType: "recent" | "oldest" | "highest" | "lowest"
  ) => {
    setSortOrder(sortType);
    setAnchorEl(null);
  };

  // Reply handlers
  const handleReplyClick = (review: Review) => {
    setSelectedReview(review);
    setReplyText(review.restaurantAnswer || "");
    setReplyDialogOpen(true);
  };

  const handleCloseReplyDialog = () => {
    setReplyDialogOpen(false);
    setSelectedReview(null);
    setReplyText("");
  };

  const handleSendReply = async () => {
    if (!selectedReview || !replyText.trim()) return;
    try {
      setLoading(true);
      await replyToReview(selectedReview.orderGroupId, replyText);
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.orderGroupId === selectedReview.orderGroupId
            ? { ...review, restaurantAnswer: replyText, isReplied: true }
            : review
        )
      );
      handleCloseReplyDialog();
    } catch (err: any) {
      console.error("Error updating review response:", err);
      setError(err.message || "Failed to update review");
    } finally {
      setLoading(false);
    }
  };

  // Date parsing
  const formatDate = (dateValue: any): string => {
    try {
      if (Array.isArray(dateValue)) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
        const date = new Date(year, month - 1, day, hour, minute, second);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        }
      } else if (typeof dateValue === "string") {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        }
      }
      console.warn("Could not parse date:", dateValue);
      return "Unknown date";
    } catch (error) {
      console.error("Error parsing date:", error);
      return "Unknown date";
    }
  };

  const getTimestamp = (dateValue: any): number => {
    if (Array.isArray(dateValue)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
      const date = new Date(year, month - 1, day, hour, minute, second);
      return date.getTime();
    } else if (typeof dateValue === "string") {
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? 0 : date.getTime();
    }
    return 0;
  };

  // Calculate overall rating
  const calculateOverallRating = (review: Review): number => {
    return (
      (review.tasteRating + review.deliveryRating + review.serviceRating) / 3
    );
  };

  // Filter reviews
  const filteredReviews = reviews.filter((review) => {
    if (filter === "all") return true;
    if (filter === "unresponded") return !review.isReplied;
    return true;
  });

  // Sort reviews
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortOrder === "highest" || sortOrder === "lowest") {
      const ratingA = calculateOverallRating(a);
      const ratingB = calculateOverallRating(b);
      return sortOrder === "highest" ? ratingB - ratingA : ratingA - ratingB;
    }
    const dateA = getTimestamp(a.reviewDate);
    const dateB = getTimestamp(b.reviewDate);
    return sortOrder === "recent" ? dateB - dateA : dateA - dateB;
  });

  // Rating color
  const getRatingColor = (rating: number): string => {
    if (rating >= 4.5) return "#4CAF50";
    if (rating >= 3.5) return "#8BC34A";
    if (rating >= 2.5) return "#FFC107";
    if (rating >= 1.5) return "#FF9800";
    return "#F44336";
  };

  // Sort label
  const getSortLabel = () => {
    switch (sortOrder) {
      case "recent":
        return "Recent First";
      case "oldest":
        return "Oldest First";
      case "highest":
        return "Highest Rated";
      case "lowest":
        return "Lowest Rated";
      default:
        return "Sort";
    }
  };

  // Order Items Display Component
  const OrderItemsList: React.FC<{ orderItems?: OrderItem[] }> = ({
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
          borderColor: (theme) => alpha(theme.palette.primary.main, 0.6),
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <ShoppingBagOutlinedIcon
            fontSize="small"
            sx={{ mr: 1, color: (theme) => theme.palette.text.secondary }}
          />
          <Typography variant="subtitle2" fontWeight={600}>
            Order Details
          </Typography>
        </Box>
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
    <Box
      sx={{
        p: { xs: 2, sm: 4 },
        backgroundColor: "background.default",
        borderRadius: 3,
        minHeight: "100vh",
        fontFamily: "'Montserrat', sans-serif",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
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
          Reviews Management
        </Typography>
        <Chip
          icon={<StarOutlineIcon />}
          label={`${reviews.length} Reviews`}
          sx={{
            fontWeight: 600,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
            borderRadius: 50,
            px: 1,
          }}
        />
      </Box>
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
            All Reviews
          </ToggleButton>
          <ToggleButton value="unresponded" aria-label="unresponded reviews">
            Unresponded
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
              Recent First
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
              Oldest First
            </MenuItem>
            <MenuItem
              onClick={() => handleSortChange("highest")}
              selected={sortOrder === "highest"}
              sx={{
                py: 1.5,
                borderLeft:
                  sortOrder === "highest"
                    ? `4px solid ${theme.palette.primary.main}`
                    : "4px solid transparent",
                fontWeight: sortOrder === "highest" ? 600 : 400,
              }}
            >
              Highest Rated
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
              Lowest Rated
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress color="primary" />
        </Box>
      )}

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
            Error loading reviews
          </Typography>
          <Typography color="text.secondary">{error}</Typography>
          <Button
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
            variant="outlined"
          >
            Try Again
          </Button>
        </Paper>
      )}

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
            alt="No reviews"
            sx={{ width: 100, height: 100, mb: 3, opacity: 0.7 }}
          />
          <Typography variant="h6" mb={2} fontWeight={600}>
            No reviews found
          </Typography>
          <Typography color="text.secondary">
            {filter === "unresponded"
              ? "You have responded to all reviews."
              : "You don't have any reviews yet."}
          </Typography>
        </Paper>
      ) : (
        !loading &&
        !error && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {sortedReviews.map((review) => {
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
                          src={review.userAvatar}
                          alt={review.userName}
                          sx={{
                            width: 56,
                            height: 56,
                            border: "2px solid",
                            borderColor: theme.palette.primary.main,
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
                          backgroundColor: alpha(theme.palette.primary.light, 0.1),
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
                              color: "text.secondary",
                              fontWeight: 500,
                            }}
                          >
                            Taste:
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
                              color: "text.secondary",
                              fontWeight: 500,
                            }}
                          >
                            Service:
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
                              color: "text.secondary",
                              fontWeight: 500,
                            }}
                          >
                            Delivery:
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
                    {/* Add this line to show order items */}
                    <OrderItemsList orderItems={review.orderItems} />
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

                    {review.restaurantAnswer && (
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          mb: 3,
                          borderRadius: 3,
                          backgroundColor: alpha(theme.palette.primary.light, 0.15),
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
                          Your Reply
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.primary"
                          sx={{ lineHeight: 1.6 }}
                        >
                          {review.restaurantAnswer}
                        </Typography>
                      </Paper>
                    )}
                    <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                      <Button
                        variant="contained"
                        startIcon={<ChatBubbleOutlineIcon />}
                        onClick={() => handleReplyClick(review)}
                        sx={{
                          borderRadius: 50,
                          px: 3,
                          py: 1,
                          textTransform: "none",
                          fontWeight: 600,
                          background: theme.palette.primary.main,
                          "&:hover": {
                            background: theme.palette.primary.dark,
                          },
                          transition: "all 0.2s ease",
                        }}
                      >
                        {review.isReplied ? "Edit Reply" : "Reply"}
                      </Button>
                    </Box>
                  </Box>
                </Card>
              );
            })}
          </Box>
        )
      )}

      {/* Reply Dialog */}
      <Dialog
        open={replyDialogOpen}
        onClose={handleCloseReplyDialog}
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
            background: "linear-gradient(90deg, #845EC2, #D65DB1)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          {selectedReview?.isReplied ? "Edit your reply" : "Reply to review"}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              fontWeight={600}
            >
              Responding to {selectedReview?.userName}'s review:
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                borderLeft: "4px solid",
                borderColor: theme.palette.primary.main,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontStyle: "italic",
                  color: "text.primary",
                }}
              >
                "{selectedReview?.review}"
              </Typography>
            </Paper>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Type your reply here..."
              value={replyText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setReplyText(e.target.value)
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  transition: "all 0.2s ease",
                  "&.Mui-focused": {
                    boxShadow: `0 0 0 3px ${alpha(
                      theme.palette.primary.main,
                      0.2
                    )}`,
                  },
                },
              }}
            />
          </Box>
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
            onClick={handleCloseReplyDialog}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "text.secondary",
              borderRadius: 50,
              px: 3,
              order: isMobile ? 1 : 1,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSendReply}
            disabled={!replyText.trim() || loading}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 50,
              px: 3,
              background: theme.palette.primary.main,
              "&:hover": {
                background: theme.palette.primary.dark,
              },
              transition: "all 0.2s ease",
              order: isMobile ? 2 : 2,
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Send Reply"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RestaurantReviewManagement;