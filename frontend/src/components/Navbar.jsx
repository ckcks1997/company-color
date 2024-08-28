import {Box, Flex, Spacer, Link, Image} from '@chakra-ui/react';
import {useNavigate} from "react-router-dom";
function Navbar() {

  const navigate = useNavigate();
  const handleMainClick = () => {
    navigate('/');
  };

  return (
    <Box py={4} position="sticky" bottom="0" width="100%">
      <Flex maxW="1150px" mx="auto" alignItems="center">
        <Box onClick={handleMainClick}>
          <Flex alignItems="center">
            <Image src="/favicon-64x64.png" alt="logo" maxH='30px' ml={2}/>
            <Box fontWeight="bold" ml={1}>
              <span>COMPANY</span><span style={{color: 'green'}}>COLOR</span>
            </Box>
          </Flex>
        </Box>
        <Spacer />
        <Box>
          <Link mr={4} href="/">검색</Link>
          <Link mr={4} href="/SiteInfo">Info</Link>
          {/*<Link mr={4} href="https://github.com/ckcks1997/company-color">Info</Link>*/}
        </Box>
      </Flex>
    </Box>
  );
}

export default Navbar;