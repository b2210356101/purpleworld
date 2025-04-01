import { createBrowserRouter } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import Layout from '../components/layout/Layout';
import NotFoundPage from '../pages/NotFoundPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />, // Header & Footer
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
]);

export default router;