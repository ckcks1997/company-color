import { Box, Flex } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

function Layout() {
  return (
    <Flex direction="column" minHeight="100vh">
      <Navbar />
      <Box height='100%' overflow="auto">
        <Outlet />
      </Box>
      <Footer />
    </Flex>
  );
}

export default Layout;