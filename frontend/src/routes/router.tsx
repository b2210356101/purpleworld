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
import MenuManagementPage from '../pages/MenuManagementPage';


// ai-gen start (claude sonnet 3.7,1)
// Component for localStorage check to restore auth state on page refresh
const AuthCheck = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Get stored authentication data from localStorage
    const token = localStorage.getItem('token');
    const storedUserType = localStorage.getItem('roleType');

    // If token exists, restore auth state to Redux
    if (token && storedUserType) {
      dispatch(login({
        token,
        roleType: storedUserType,
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
      return <div>Restaurant Dashboard</div>;
    case 'COURIER':
      // Placeholder for courier dashboard
      return <div>Courier Dashboard</div>;
    case 'ADMIN':
      // Placeholder for admin dashboard
      return <div>Admin Dashboard</div>;
    default:
      return <HomePage />;
  }
};

// Interface for PrivateRoute props
interface PrivateRouteProps {
  children: ReactNode;
}

// Private route component - redirects to login if not authenticated
const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated } = useAppSelector(state => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Interface for role-specific private route props
interface RoleSpecificRouteProps {
  children: ReactNode;
  allowedRole: string;
}

// Role-specific private route component that checks both authentication and role
const RoleSpecificRoute = ({ children, allowedRole }: RoleSpecificRouteProps) => {
  const { isAuthenticated, userType } = useAppSelector(state => state.auth);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to home if authenticated but wrong role
  if (userType !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Restaurant-specific route component
const RestaurantRoute = ({ children }: { children: ReactNode }) => {
  return <RoleSpecificRoute allowedRole="RESTAURANT">{children}</RoleSpecificRoute>;
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
            path: 'profile',
            element: (
              <PrivateRoute>
                <div>Profile Page</div>
              </PrivateRoute>
            )
          },
          // Restaurant specific routes
          {
            path: 'restaurant/menu',
            element: (
              <RestaurantRoute>
                <MenuManagementPage />
              </RestaurantRoute>
            )
          },
          {
            path: 'register',
            element: <RegisterPage />
          },
          {
            path: '*',
            element: <NotFoundPage />
          }
        ]
      }
    ]
  }
]);

export default router;