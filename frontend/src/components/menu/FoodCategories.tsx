import { Box, Card, Typography, IconButton } from "@mui/material";
import {
    LocalPizza,
    Fastfood,
    Restaurant,
    Spa,
    Cake,
    SetMeal,
    KebabDining,
    SoupKitchen,
    WrapText,
    LocalFlorist,
    ArrowForward,
    ArrowBack
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useRef, useState } from "react";

interface FoodCategory {
    id: string;
    name: string;
    icon: React.ReactNode;
}

interface FoodCategoriesProps {
    showHeader?: boolean;
    title?: string;
}

const FoodCategories: React.FC<FoodCategoriesProps> = ({ showHeader = false, title }) => {
    const { t } = useTranslation();
    const sliderRef = useRef<Slider>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Food categories
    const foodCategories: FoodCategory[] = [
        { id: "pizza", name: t("homepage.categories.pizza"), icon: <LocalPizza fontSize="large" /> },
        { id: "burger", name: t("homepage.categories.burger"), icon: <Fastfood fontSize="large" /> },
        { id: "pasta", name: t("homepage.categories.pasta"), icon: <Restaurant fontSize="large" /> },
        { id: "salad", name: t("homepage.categories.salad"), icon: <Spa fontSize="large" /> },
        { id: "dessert", name: t("homepage.categories.dessert"), icon: <Cake fontSize="large" /> },
        { id: "sushi", name: t("homepage.categories.sushi"), icon: <SetMeal fontSize="large" /> },
        { id: "kebab", name: t("homepage.categories.kebab"), icon: <KebabDining fontSize="large" /> },
        { id: "soup", name: t("homepage.categories.soup"), icon: <SoupKitchen fontSize="large" /> },
        { id: "wraps", name: t("homepage.categories.wraps"), icon: <WrapText fontSize="large" /> },
        { id: "vegan", name: t("homepage.categories.vegan"), icon: <LocalFlorist fontSize="large" /> },
    ];

    // Handle navigation
    const handlePrev = () => {
        if (sliderRef.current) {
            sliderRef.current.slickPrev();
        }
    };

    const handleNext = () => {
        if (sliderRef.current) {
            sliderRef.current.slickNext();
        }
    };

    // Slider settings
    // ai-gen start (claude)
    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 1,
        arrows: true,
        swipe: true,
        swipeToSlide: true,
        draggable: true,
        touchThreshold: 5,
        beforeChange: () => setIsDragging(true),
        afterChange: () => setIsDragging(false),
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 4,
                }
            },
            {
                breakpoint: 900,
                settings: {
                    slidesToShow: 3,
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 2,
                }
            }
        ]
    };

    // Handle card click to prevent navigation when dragging
    const handleCardClick = (e: React.MouseEvent, categoryId: string) => {
        if (isDragging) {
            e.preventDefault();
        }
    };
    // ai-gen end

    return (
        <Box sx={{
            position: "relative",
            overflow: "visible",
            px: 2
        }}>
            {/* Header section with title and navigation arrows */}
            {showHeader && <Box sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
            }}>
                <Typography variant="h5" fontWeight="bold">
                    {title || t('homepage.categories.search')}
                </Typography>

                {/* Navigation arrows */}
                <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton
                        onClick={handlePrev}
                        sx={{
                            transition: "0.3s ease",
                            boxShadow: '0px 0px 10px rgba(132, 94, 194, 0.2)',
                            "&:hover": { backgroundColor: "primary.light" }
                        }}
                        size="small"
                    >
                        <ArrowBack color="primary" fontSize="small" />
                    </IconButton>
                    <IconButton
                        onClick={handleNext}
                        sx={{
                            boxShadow: '0px 0px 10px rgba(132, 94, 194, 0.2)',
                            transition: "0.2s ease",
                            "&:hover": { backgroundColor: "primary.light" }
                        }}
                        size="small"
                    >
                        <ArrowForward color="primary" fontSize="small" />
                    </IconButton>
                </Box>
            </Box>}

            {/* Wrapper for the slider to prevent overflow issues */}
            <Box>
                <Slider ref={sliderRef} {...settings}>
                    {foodCategories.map((category) => (
                        <Box
                            key={category.id}
                            sx={{
                                px: 2,
                                py: 2,
                                overflow: "visible",
                                position: "relative",
                                "& a": {
                                    pointerEvents: "auto"
                                },
                            }}
                        >
                            <Card
                                component={Link}
                                draggable="false"
                                to={`/category/${category.id}`}
                                onClick={(e) => handleCardClick(e, category.id)}
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    p: 2,
                                    borderRadius: 4,
                                    bgcolor: "primary.light",
                                    textDecoration: "none",
                                    height: "100%",
                                    "&:hover": {
                                        boxShadow: "0px 0px 15px rgba(132, 94, 194, 0.4)",
                                    },
                                    transition: "box-shadow 0.3s ease-in-out",
                                }}
                            >
                                <Box
                                    sx={{
                                        backgroundColor: "background.default",
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
                        </Box>
                    ))}
                </Slider>
            </Box>
        </Box>
    );
};

export default FoodCategories;