'use client'

import { Box, Button, Flex, Image, Spacer, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth, useKakaoLogin, useLogout } from '@/lib/hooks/useAuth'

function Navbar() {
  const router = useRouter()
  const { isLoggedIn, user, isLoading } = useAuth()
  const kakaoLogin = useKakaoLogin()
  const logout = useLogout()

  return (
    <Box py={4} position="sticky" bottom="0" width="100%">
      <Flex maxW="1150px" mx="auto" alignItems="center">
        <Box onClick={() => router.push('/')} cursor="pointer">
          <Flex alignItems="center" ml={1}>
            <Image src="/favicon-64x64.png" alt="logo" maxH="30px" ml={2} />
            <Box fontWeight="bold" ml={1}>
              <span>COMPANY</span> <span style={{ color: '#2b6cb0' }}>COLOR</span>
            </Box>
          </Flex>
        </Box>
        <Spacer />
        <Box display="flex" alignItems="center" gap={4} mr={4}>
          <NextLink href="/">검색</NextLink>
          <NextLink href="/rank">통계</NextLink>
          <NextLink href="/siteInfo">정보</NextLink>
          {!isLoading && (isLoggedIn ? (
            <>
              <NextLink href="/me">
                <Text fontSize="sm" color="gray.700">
                  {user?.nickname || '내 정보'}
                </Text>
              </NextLink>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  void logout()
                }}
              >
                로그아웃
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              colorScheme="yellow"
              onClick={kakaoLogin}
            >
              카카오 로그인
            </Button>
          ))}
        </Box>
      </Flex>
    </Box>
  )
}

export default Navbar
