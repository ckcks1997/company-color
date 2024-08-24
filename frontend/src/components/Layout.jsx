import { Box, Flex } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

function Layout() {
  return (
    <Flex direction="column"
          minHeight="100vh"
          // backgroundImage="url('/images/main.jpg')"
          backgroundSize="cover"
          backgroundAttachment="fixed"
          backgroundPosition="left">
      <Navbar />
      <Box minHeight='100%' overflow="auto">
        <Outlet />
      </Box>
      <Footer />
    </Flex>
  );
}

export default Layout;