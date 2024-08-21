import { Box, Flex, Spacer, Link } from '@chakra-ui/react';

function Navbar() {
  return (
    <Box bg="gray.100" py={4} position="sticky" bottom="0" width="100%">
      <Flex maxW="container.lg" mx="auto" alignItems="center">
        <Box>
          <Link href="/" fontWeight="bold" ml={4}>
            <span>COMPANY</span><span style={{color: 'green'}}>COLOR</span>
          </Link>
        </Box>
        <Spacer />
        <Box>
          <Link mr={4} href="/">검색</Link>
          <Link mr={4} href="/info">Info</Link>
        </Box>
      </Flex>
    </Box>
  );
}

export default Navbar;