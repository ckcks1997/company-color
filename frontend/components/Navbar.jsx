'use client'

import {Box, Flex, Spacer, Image} from '@chakra-ui/react';
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import {useEffect, useCallback} from "react";
import {authApi} from "../lib/api/api.js"
import useLoadingStore from "../lib/store/loadingStore.js";
import usePageStore from "../lib/store/pageStore.js";

function Navbar() {

  const router = useRouter()
  const { setLoading } = useLoadingStore();
  const { previousLocation } = usePageStore()

  const handleKakaoCallback = useCallback(async (code) => {
    console.log(previousLocation)
    //await navigate(previousLocation);
    setLoading(true); // 로딩 시작
    try {
      let result = await authApi.getAccessToken(code);
      console.log(result)
    } catch (error) {
      console.error('kakao backend 인증 실패', error);
      authApi.logout();
    } finally {
      setLoading(false); // 로딩 종료
    }
  }, [previousLocation, setLoading]);


  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      handleKakaoCallback(code);
    }
  }, [handleKakaoCallback]);

  return (
    <Box py={4} position="sticky" bottom="0" width="100%">
      <Flex maxW="1150px" mx="auto" alignItems="center">
        <Box onClick={() => router.push('/')}>
          <Flex alignItems="center">
            <Image src="/favicon-64x64.png" alt="logo" maxH='30px' ml={2}/>
            <Box fontWeight="bold" ml={1}>
              <span>COMPANY</span> <span style={{color: '#2b6cb0'}}>COLOR</span>
            </Box>
          </Flex>
        </Box>
        <Spacer />
        <Box display="flex" gap={4}>
          <NextLink href="/">검색</NextLink>
          <NextLink href="/rank">통계</NextLink>
          <NextLink href="/siteInfo">정보</NextLink>
          <NextLink href="https://github.com/ckcks1997/company-color" target="_blank">
            <Image
              src="/images/git.png"
              alt="Git logo"
              maxWidth="25px"
              style={{opacity: 0.5}}
            />
          </NextLink>
        </Box>
      </Flex>
    </Box>
  );
  }

  export default Navbar;