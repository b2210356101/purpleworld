import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useEffect, ReactNode } from 'react';
import HomePage from '../pages/HomePage';
import Layout from '../components/layout/Layout';
import NotFoundPage from '../pages/NotFoundPage';
import LoginPage from '../pages/LoginPage';
import CustomerHomePage from '../pages/CustomerHomePage';
import { login } from '../store/slices/authSlice';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import RegisterPage from '../pages/RegisterPage';
import MenuManagementPage from "../pages/MenuManagementPage";
import CartPage from "../pages/CartPage";
import CheckoutPage from '../pages/CheckoutPage';
import RestaurantOrderPage from '../pages/RestaurantOrderPage';
import RestaurantDashboard from '../pages/RestaurantDashboard';
import AdminRestaurantManagementPage from '../pages/AdminRestaurantManagementPage';
import AdminCourierManagementPage from "../pages/AdminCourierManagementPage";
import AdminDashboard from "../pages/AdminDashboard";
import CourierDashboard from '../pages/CourierDashboard';
import ContactPage from '../pages/ContactPage';
import AboutPage from '../pages/AboutPage';
import CustomerOrdersPage from '../pages/CustomerOrdersPage';
import GDPRPage from '../pages/GDPRPage';
import CookiePolicyPage from '../pages/CookiePolicyPage';
import RestaurantPage from '../pages/RestaurantPage';
import SearchResultsPage from '../pages/SearchResultPage';
import RestaurantsPage from '../pages/RestaurantsPage';
import RestaurantReviewManagement from '../pages/RestaurantReviewManagement';
import RestaurantReviewsPage from '../pages/RestaurantReviews';
import StockManagementPage from '../pages/StockManagementPage';
import PopularFoodsPage from '../pages/PopularFoodsPage';
import FavoritesPage from '../pages/FavoritesPage';
import { ResetPasswordPage } from "../pages/ResetPasswordPage";
import { ForgotPasswordPage } from "../pages/ForgotPasswordPage";
import AdminPromotionManagementPage from '../pages/AdminPromotionManagementPage';
import ProfileManagement from "../pages/ProfileManagement";
import CourierOrdersPage from '../pages/CourierOrdersPage';




// ai-gen start (claude sonnet 3.7,1)
// Component for localStorage check to restore auth state on page refresh
const AuthCheck = () => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        // Get stored authentication data from localStorage
        const token = localStorage.getItem('token');
        const storedUserType = localStorage.getItem('roleType');
        const username = localStorage.getItem('username');
        const profileImage = localStorage.getItem('profileImage');

        // If token and username exist, restore auth state to Redux
        if (token && storedUserType && username) {
            dispatch(login({
                token,
                role: storedUserType,
                username,
                profileImage
            }));
        }
    }, [dispatch]);

    // Render child routes
    return <Outlet />;
};

// Dynamic home page component that renders different dashboards based on user role
const DynamicHomePage = () => {
    const { isAuthenticated, userType } = useAppSelector(state => state.auth);

    // If not authenticated, show public homepage
    if (!isAuthenticated) {
        return <HomePage />;
    }

    // Show appropriate dashboard based on user role
    switch (userType) {
        case 'CUSTOMER':
            return <CustomerHomePage />;
        case 'RESTAURANT':
            // Placeholder for restaurant dashboard
            return <RestaurantDashboard />;
        case 'COURIER':
            // Placeholder for courier dashboard
            return <CourierDashboard />;
        case 'ADMIN':
            // Placeholder for admin dashboard
            return <AdminDashboard />;
        default:
            return <HomePage />;
    }
};

// Interface for RoleBasedRoute props
interface RoleBasedRouteProps {
    children: ReactNode;
    allowedRoles: string[];
    redirectTo?: string;
}

// Role-based route component
const RoleBasedRoute = ({ children, allowedRoles, redirectTo = "/" }: RoleBasedRouteProps) => {
    const { isAuthenticated, userType } = useAppSelector(state => state.auth);

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // If user role is not allowed, redirect to specified path
    if (userType && !allowedRoles.includes(userType)) {
        return <Navigate to={redirectTo} replace />;
    }

    // User is authenticated and has allowed role, render children
    return <>{children}</>;
};
// ai-gen end

const router = createBrowserRouter([
    {
        element: <AuthCheck />,
        children: [
            {
                path: '/',
                element: <Layout />, // Header & Footer layout
                children: [
                    {
                        index: true,
                        element: <DynamicHomePage /> // Dynamic homepage based on auth status and role
                    },
                    {
                        path: 'login',
                        element: <LoginPage />
                    },
                    {
                        path: 'register',
                        element: <RegisterPage />
                    },
                    {
                        path: 'restaurants',
                        element: <RestaurantsPage />
                    },
                    {
                        path: 'search',
                        element: <SearchResultsPage />
                    },
                    {
                        path: 'category/:categoryName',
                        element: <SearchResultsPage />
                    },
                    {
                        path: 'contact',
                        element: <ContactPage />
                    },
                    {
                        path: 'about',
                        element: <AboutPage />
                    },
                    {
                        path: 'forgot-password',
                        element: <ForgotPasswordPage />
                    },
                    {
                        path: 'reset-password',
                        element: <ResetPasswordPage />
                    },
                    {
                        path: 'gdpr',
                        element: <GDPRPage />
                    },
                    {
                        path: 'cookie',
                        element: <CookiePolicyPage />
                    },
                    {
                        path: 'profile',
                        element: (
                            <RoleBasedRoute allowedRoles={['CUSTOMER', 'RESTAURANT', 'COURIER', 'ADMIN']}> <ProfileManagement /> </RoleBasedRoute>
                        )
                    },
                    {
                        path: 'cart',
                        element: <RoleBasedRoute allowedRoles={['CUSTOMER']}> <CartPage /> </RoleBasedRoute>
                    },
                    {
                        path: 'checkout',
                        element: <RoleBasedRoute allowedRoles={['CUSTOMER']}> <CheckoutPage /> </RoleBasedRoute>
                    },
                    {
                        path: 'orders',
                        element: <RoleBasedRoute allowedRoles={['CUSTOMER']}> < CustomerOrdersPage /> </RoleBasedRoute>
                    },
                    {
                        path: 'favorites',
                        element: <RoleBasedRoute allowedRoles={['CUSTOMER']}> < FavoritesPage /> </RoleBasedRoute>
                    },
                    {
                        path: 'popular-foods',
                        element: <RoleBasedRoute allowedRoles={['CUSTOMER']}> <PopularFoodsPage /> </RoleBasedRoute>
                    },
                    {
                        path: 'restaurant/menu',
                        element: <RoleBasedRoute allowedRoles={['RESTAURANT']}> <MenuManagementPage /> </RoleBasedRoute>
                    },
                    {
                        path: 'restaurant/orders',
                        element: <RoleBasedRoute allowedRoles={['RESTAURANT']}> <RestaurantOrderPage /> </RoleBasedRoute>
                    },
                    {
                        path: 'restaurant/menu',
                        element: <RoleBasedRoute allowedRoles={['RESTAURANT']}> <MenuManagementPage /> </RoleBasedRoute>
                    },
                    {
                        path: 'restaurant/stock',
                        element: <RoleBasedRoute allowedRoles={['RESTAURANT']}> <StockManagementPage /> </RoleBasedRoute>
                    },
                    {
                        path: 'cart',
                        element: <RoleBasedRoute allowedRoles={['CUSTOMER']}> <CartPage /> </RoleBasedRoute>
                    },
                    {
                        path: 'checkout',
                        element: <RoleBasedRoute allowedRoles={['CUSTOMER']}> <CheckoutPage /> </RoleBasedRoute>
                    },
                    {
                        path: 'admin/restaurants',
                        element: <RoleBasedRoute allowedRoles={['ADMIN']}> <AdminRestaurantManagementPage /> </RoleBasedRoute>
                    },
                    {
                        path: 'admin/couriers',
                        element: <RoleBasedRoute allowedRoles={['ADMIN']}> <AdminCourierManagementPage /> </RoleBasedRoute>
                    },
                    {
                        path: 'admin/promotions',
                        element: <RoleBasedRoute allowedRoles={['ADMIN']}> <AdminPromotionManagementPage /> </RoleBasedRoute>
                    },
                    {
                        path: 'restaurants/:id',
                        element: <RestaurantPage />
                    },
                    {
                        path: 'restaurant/reviews',
                        element: <RoleBasedRoute allowedRoles={['RESTAURANT']}> <RestaurantReviewManagement /> </RoleBasedRoute>
                    },
                    {
                        path: 'restaurants/:id/reviews',
                        element: <RestaurantReviewsPage />
                    },
                    {
                        path: 'courier/orders',
                        element: <CourierOrdersPage />
                    },
                    {
                        path: '*',
                        element: <NotFoundPage />
                    },
                ]
            }
        ]
    }
]);

export default router;