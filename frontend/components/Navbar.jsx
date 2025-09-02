'use client'

import {Box, Flex, Spacer, Image} from '@chakra-ui/react';
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'

function Navbar() {

  const router = useRouter()

  return (
    <Box py={4} position="sticky" bottom="0" width="100%">
      <Flex maxW="1150px" mx="auto" alignItems="center">
        <Box onClick={() => router.push('/')}>
          <Flex alignItems="center" ml={1}>
            <Image src="/favicon-64x64.png" alt="logo" maxH='30px' ml={2}/>
            <Box fontWeight="bold" ml={1}>
              <span>COMPANY</span> <span style={{color: '#2b6cb0'}}>COLOR</span>
            </Box>
          </Flex>
        </Box>
        <Spacer />
        <Box display="flex" gap={4} mr={4}>
          <NextLink href="/">검색</NextLink>
          <NextLink href="/rank">통계</NextLink>
          <NextLink href="/siteInfo">정보</NextLink>
        </Box>
      </Flex>
    </Box>
  );
  }

  export default Navbar;