import React from "react";
import { Box, Typography, IconButton, Paper, Divider } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import { Restaurant } from "../../types";
import {t} from "i18next";

interface RestaurantItemsProps {
  restaurant: Restaurant;
  onQuantityChange: (
    itemId: number,
    operation: "+" | "-",
    quantity: number
  ) => void;
  minAmountError?: { restAmount: number }
}

const RestaurantItems: React.FC<RestaurantItemsProps> = ({
    restaurant,
    onQuantityChange,
    minAmountError,
}) => {
  return (
    <Paper sx={{ borderRadius: 2, overflow: "hidden", boxShadow: 1 }}>
      {/* Restaurant Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: "primary.main",
          color: "white",
          display: "flex",
          alignItems: "center",
        }}
      >
          <Box sx={{display:'flex',justifyContent:'space-between',width:'100%'}}>
              <Typography fontWeight={600}>
                  {restaurant.restaurantName}
              </Typography>
              <Typography>
                  Min: {restaurant.minAmount}₺
              </Typography>
          </Box>
      </Box>

        {minAmountError && (
            <Box
                sx={{
                    bgcolor: 'rgba(255, 234, 234, 0.7)',
                    color: 'error.dark',
                    px: 2,
                    py: 1,
                    fontSize: 13,
                    fontWeight: 500,
                    borderLeft: '3px solid',
                    borderColor: 'error.main',
                }}
            >
                <Typography variant="body2">
                    {t('cart.minAmountMissing', { amount: minAmountError.restAmount })}
                </Typography>
            </Box>
        )}


      {/* Restaurant Items */}
      <Box sx={{ p: 2 }}>
        {restaurant.items &&
          restaurant.items.map((item, index) => (
            <React.Fragment key={item.id}>
              {index > 0 && <Divider sx={{ my: 1.5 }} />}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                {/* Item Image */}
                <Box
                  component="img"
                  src={item.image}
                  sx={{ width: 60, height: 60, borderRadius: 1 }}
                />

                {/* Item Details */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      wordBreak: "break-word",
                    }}
                  >
                    {item.name}
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color="primary">
                    {item.price}₺
                  </Typography>
                </Box>

                {/* Quantity Control */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    bgcolor: "primary.main",
                    borderRadius: "20px",
                    px: 1,
                    height: 32,
                    color: "white",
                  }}
                >
                  <IconButton
                    size="small"
                    sx={{ color: "white", p: 0.5 }}
                    onClick={() =>
                      onQuantityChange(item.id, "-", item.quantity)
                    }
                  >
                    {item.quantity === 1 ? (
                      <DeleteIcon fontSize="small" />
                    ) : (
                      <RemoveIcon fontSize="small" />
                    )}
                  </IconButton>
                  <Typography fontWeight={600} fontSize={14} px={1}>
                    {item.quantity}
                  </Typography>
                  <IconButton
                    size="small"
                    sx={{ color: "white", p: 0.5 }}
                    onClick={() =>
                      onQuantityChange(item.id, "+", item.quantity)
                    }
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </React.Fragment>
          ))}
      </Box>
    </Paper>
  );
};

export default RestaurantItems;
