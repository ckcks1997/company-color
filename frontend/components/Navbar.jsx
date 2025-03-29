'use client'

import {Box, Flex, Spacer, Link, Image} from '@chakra-ui/react';
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import {useEffect, useState} from "react";
import {api, authApi} from "../lib/api/api.js"
import useLoadingStore from "../lib/store/loadingStore.js";
import usePageStore from "../lib/store/pageStore.js";

function Navbar() {

  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { setLoading } = useLoadingStore();
  const { previousLocation, setPreviousLocation,  clearPreviousLocation } = usePageStore()

  const handleKakaoLogin = async() => {
    authApi.goKakaoLogin()
  }

  const handleLogout = async() => {
    authApi.logout();
    window.location.reload();
  }

  const handleKakaoCallback = async (code) => {
    console.log(previousLocation)
    //await navigate(previousLocation);
    setLoading(true); // 로딩 시작
    try {
      let result = await authApi.getAccessToken(code);
      console.log(result)
      setIsLoggedIn(true);
    } catch (error) {
      console.error('kakao backend 인증 실패', error);
      authApi.logout();
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      handleKakaoCallback(code);
    }
  }, []);

  return (
    <Box px={3} py={4} position="sticky" bottom="0" width="100%">
      <Flex maxW="1150px" mx="auto" alignItems="center">
        <Box onClick={() => router.push('/')}>
          <Flex alignItems="center">
            <Image src="/favicon-64x64.png" alt="logo" maxH='30px'/>
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
        </Box>
      </Flex>
    </Box>
  );
  }

  export default Navbar;