import {Box, Flex, Spinner, Center} from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import useLoadingStore from "../store/loadingStore.js";

function Layout() {
  const {isLoading} = useLoadingStore();

  return (
    <Flex
      direction="column"
      minHeight="100vh"
      backgroundSize="cover"
      backgroundAttachment="fixed"
      backgroundPosition="left"
      position="relative"
    >
      <Navbar />
      <Box minHeight='100%' overflow="auto">
        {isLoading ? (
          <Center position="absolute" top="0" left="0" right="0" bottom="0" bg="rgba(255, 255, 255, 0.8)" zIndex="1000">
            <Spinner
              thickness='4px'
              speed='0.65s'
              color='blue.500'
              size='xl'
            />
          </Center>
        ) : null}
        <Outlet />
      </Box>
      <Footer />
    </Flex>
  );
}

export default Layout;