// WriteReviewModal component
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  alpha,
  useMediaQuery,
  CircularProgress
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { OrderDTO, CustomerCurrentOrderDTO, OrderItemDTO, UserInfo } from "../../types";
import { getOrderDetails } from "../../utils/api";

interface Ratings {
  taste: number;
  service: number;
  delivery: number;
}

export interface ReviewSubmitData {
  ratings: Ratings;
  comment: string;
  orderGroupId: number;
}

interface WriteReviewModalProps {
  open: boolean;
  onClose: () => void;
  orderGroup: CustomerCurrentOrderDTO;
  parentOrder: OrderDTO;
  onSubmit: (data: ReviewSubmitData) => void;
}

const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  open,
  onClose,
  orderGroup,
  parentOrder,
  onSubmit
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [ratings, setRatings] = useState<Ratings>({
    taste: 0,
    service: 0,
    delivery: 0
  });
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [orderItems, setOrderItems] = useState<OrderItemDTO[]>([]);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setRatings({ taste: 0, service: 0, delivery: 0 });
      setComment('');
      setSubmitting(false);
      
      // Fetch order items for review
      const fetchOrderItems = async () => {
        try {
          const details = await getOrderDetails(orderGroup.orderGroupId);
          setOrderItems(details.items || []);
        } catch (err) {
          console.error('Error fetching order details for review:', err);
          setOrderItems([]);
        }
      };
      
      fetchOrderItems();
    }
  }, [open, orderGroup.orderGroupId]);

  const handleSubmit = () => {
    if (
      ratings.taste === 0 ||
      ratings.service === 0 ||
      ratings.delivery === 0 ||
      comment.trim() === ''
    ) {
      return; // Basic validation
    }

    setSubmitting(true);
    
    const reviewData: ReviewSubmitData = {
      ratings,
      comment: comment.trim(),
      orderGroupId: orderGroup.orderGroupId
    };

    onSubmit(reviewData);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: '0px 0px 10px rgba(132, 94, 194, 0.2)'
        }
      }}
    >
      <DialogTitle
        sx={{
          py: 3,
          px: 3,
          fontWeight: 700,
          background: 'linear-gradient(90deg, #845EC2, #D65DB1)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent'
        }}
      >
        Write a Review for {orderGroup.restaurantName}
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle2" sx={{ width: 80, fontWeight: 500 }}>
              Taste:
            </Typography>
            <Rating
              value={ratings.taste}
              onChange={(_, value) => setRatings({ ...ratings, taste: value || 0 })}
              precision={0.5}
              size="large"
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle2" sx={{ width: 80, fontWeight: 500 }}>
              Service:
            </Typography>
            <Rating
              value={ratings.service}
              onChange={(_, value) => setRatings({ ...ratings, service: value || 0 })}
              precision={0.5}
              size="large"
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle2" sx={{ width: 80, fontWeight: 500 }}>
              Delivery:
            </Typography>
            <Rating
              value={ratings.delivery}
              onChange={(_, value) => setRatings({ ...ratings, delivery: value || 0 })}
              precision={0.5}
              size="large"
            />
          </Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            placeholder="Share your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                transition: 'all 0.2s ease',
                '&.Mui-focused': {
                  boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`
                }
              }
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{
        p: 3,
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "stretch" : "center",
        gap: isMobile ? 2 : 1
      }}>
        <Button
          onClick={onClose}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            color: '#9e9e9e',
            borderRadius: 50,
            px: 3,
            order: isMobile ? 1 : 1
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={ratings.taste === 0 ||
                    ratings.service === 0 ||
                    ratings.delivery === 0 ||
                    comment.trim() === '' ||
                    submitting
                    }
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 50,
            px: 3,
            boxShadow: '0 4px 10px rgba(132, 94, 194, 0.3)',
            background: theme.palette.primary.main,
            '&:hover': {
              background: '#59408b',
              boxShadow: '0 6px 15px rgba(132, 94, 194, 0.4)',
            },
            transition: 'all 0.2s ease',
            order: isMobile ? 2 : 2
          }}
        >
          {submitting ? <CircularProgress size={24} color="inherit" /> : 'Submit Review'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WriteReviewModal;