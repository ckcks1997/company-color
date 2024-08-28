import { createBrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import Result from './pages/Result';
import ErrorPage from './pages/ErrorPage';
import BusinessInfo from './pages/BusinessInfo.jsx';
import Layout from './components/Layout';
import SiteInfo from "./pages/SiteInfo.jsx";

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
      },{
        path: 'businessInfo',
        element: <BusinessInfo />,
      },{
        path: 'siteInfo',
        element: <SiteInfo />,
      }

    ],
  },
]);

export default router;