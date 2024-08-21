import { createBrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import Result from './pages/Result';
import ErrorPage from './pages/ErrorPage';
import Layout from './components/Layout';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'result',
        element: <Result />,
      },
    ],
  },
]);

export default router;