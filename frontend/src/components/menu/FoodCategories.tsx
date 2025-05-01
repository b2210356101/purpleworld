import { Box, Card, Grid, Typography } from "@mui/material";
import { LocalPizza, Fastfood, Restaurant, Spa, Cake, SetMeal } from "@mui/icons-material";
import { Link } from "react-router-dom";

interface FoodCategory {
    id: string;
    name: string;
    icon: React.ReactNode;
}



const FoodCategories = () => {
    // Food categories
    const foodCategories: FoodCategory[] = [
        { id: 'pizza', name: 'Pizza', icon: <LocalPizza fontSize="large" /> },
        { id: 'burger', name: 'Burger', icon: <Fastfood fontSize="large" /> },
        { id: 'pasta', name: 'Pasta', icon: <Restaurant fontSize="large" /> },
        { id: 'salad', name: 'Salad', icon: <Spa fontSize="large" /> },
        { id: 'desserts', name: 'Desserts', icon: <Cake fontSize="large" /> },
        { id: 'sushi', name: 'Sushi', icon: <SetMeal fontSize="large" /> },
    ];


    return (
        <Grid container spacing={4} sx={{ justifyContent: "space-between" }}>
            {foodCategories.map((category) => (
                <Grid key={category.id} size={{ xs: 6, sm: 4, md: 2 }} >
                    <Card
                        component={Link}
                        to={`/category/${category.id}`}
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            p: 2,
                            borderRadius: 4,
                            bgcolor: "primary.light",
                            textDecoration: "none",
                            "&:hover": {
                                boxShadow: "0px 0px 15px rgba(132, 94, 194, 0.4)",
                            },
                        }}
                    >
                        <Box
                            sx={{
                                backgroundColor: "#fff",
                                borderRadius: "50%",
                                mb: 2,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                width: 70,
                                height: 70,
                                color: "primary.dark",
                            }}
                        >
                            {category.icon}
                        </Box>
                        <Typography component="h2" sx={{ fontWeight: 500 }}>
                            {category.name}
                        </Typography>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default FoodCategories;
