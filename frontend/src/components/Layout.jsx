import { Box, Flex } from '@chakra-ui/react';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

function Layout({ children }) {
  return (
    <Flex direction="column" minHeight="100vh">
      <Navbar />
      <Box height='100%' overflow="auto">
        {children}
      </Box>
      <Footer />
    </Flex>
  );
}
export default Layout;