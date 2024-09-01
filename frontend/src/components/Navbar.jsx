import {Box, Flex, Spacer, Link, Image} from '@chakra-ui/react';
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import axios from "axios";
import {setToken} from "../utils/auth.js";
function Navbar() {

  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const KAKAO_CLIENT_ID = `${import.meta.env.VITE_KAKAO_JS_CLIENT_ID}`
  const KAKAO_REDIRECT_URI = `${import.meta.env.VITE_FRONT_URL}`

  const handleMainClick = () => {
    navigate('/');
  };

  const handleKakaoLogin = async() => {
    const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`;
    window.location.href = kakaoAuthURL;
  }

  const handleKakaoCallback = async (code) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/oauth?code=${code}`);
      const { access_token } = response.data;
      setToken('token', access_token);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('kakao backend 인증 실패', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
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
    <Box py={4} position="sticky" bottom="0" width="100%">
      <Flex maxW="1150px" mx="auto" alignItems="center">
        <Box onClick={handleMainClick}>
          <Flex alignItems="center">
            <Image src="/favicon-64x64.png" alt="logo" maxH='30px' ml={2}/>
            <Box fontWeight="bold" ml={1}>
              <span>COMPANY</span> <span style={{color: 'green'}}>COLOR</span>
            </Box>
          </Flex>
        </Box>
        <Spacer />
        <Box>
          <Link mr={4} href="/">검색</Link>
          <Link mr={4} href="/SiteInfo">정보</Link>
            <Link mr={4} onClick={handleKakaoLogin}>로그인</Link>
        </Box>
      </Flex>
    </Box>
  );
  }

  export default Navbar;