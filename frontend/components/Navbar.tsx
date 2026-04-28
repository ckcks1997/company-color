'use client'

import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  IconButton,
  Image,
  Spacer,
  Text,
  VStack,
  useDisclosure,
} from '@chakra-ui/react'
import { Menu as MenuIcon } from 'lucide-react'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth, useKakaoLogin, useLogout } from '@/lib/hooks/useAuth'

interface NavLinkItem {
  href: string
  label: string
}

const NAV_LINKS: ReadonlyArray<NavLinkItem> = [
  { href: '/', label: '검색' },
  { href: '/rank', label: '통계' },
  { href: '/siteInfo', label: '정보' },
]

function Navbar() {
  const router = useRouter()
  const { isLoggedIn, user, isLoading } = useAuth()
  const kakaoLogin = useKakaoLogin()
  const logout = useLogout()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleLogout = () => {
    void logout()
    onClose()
  }

  const handleKakaoLogin = () => {
    onClose()
    kakaoLogin()
  }

  return (
    <Box
      py={3}
      position="sticky"
      bottom="0"
      width="100%"
      zIndex={10}
      bg="whiteAlpha.800"
      backdropFilter="blur(10px)"
      borderBottom="1px solid"
      borderColor="blackAlpha.100"
      boxShadow="sm"
    >
      <Flex maxW="1150px" mx="auto" alignItems="center" color="gray.800" px={2}>
        <Box onClick={() => router.push('/')} cursor="pointer">
          <Flex alignItems="center" ml={1}>
            <Image src="/favicon-64x64.png" alt="logo" maxH="30px" ml={2} />
            <Box fontWeight="bold" ml={1}>
              <span>COMPANY</span> <span style={{ color: '#2b6cb0' }}>COLOR</span>
            </Box>
          </Flex>
        </Box>
        <Spacer />

        {/* 데스크톱: 인라인 메뉴 */}
        <Box display={{ base: 'none', md: 'flex' }} alignItems="center" gap={4} mr={4}>
          {NAV_LINKS.map((link) => (
            <NextLink key={link.href} href={link.href} style={{ color: 'inherit' }}>
              {link.label}
            </NextLink>
          ))}
          {!isLoading &&
            (isLoggedIn ? (
              <>
                <NextLink href="/me" style={{ color: 'inherit' }}>
                  <Text fontSize="sm" color="gray.800" fontWeight="medium">
                    {user?.nickname || '내 정보'}
                  </Text>
                </NextLink>
                <Button size="sm" variant="outline" onClick={() => void logout()}>
                  로그아웃
                </Button>
              </>
            ) : (
              <Button size="sm" colorScheme="yellow" onClick={kakaoLogin}>
                카카오 로그인
              </Button>
            ))}
        </Box>

        {/* 모바일: 햄버거 버튼 */}
        <IconButton
          display={{ base: 'inline-flex', md: 'none' }}
          aria-label="메뉴 열기"
          icon={<MenuIcon size={20} />}
          variant="ghost"
          size="md"
          onClick={onOpen}
          mr={2}
        />
      </Flex>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>메뉴</DrawerHeader>

          <DrawerBody>
            <VStack align="stretch" spacing={3}>
              {NAV_LINKS.map((link) => (
                <NextLink
                  key={link.href}
                  href={link.href}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                  onClick={onClose}
                >
                  <Box
                    py={2}
                    px={3}
                    borderRadius="md"
                    fontSize="md"
                    fontWeight="medium"
                    _hover={{ bg: 'gray.100' }}
                  >
                    {link.label}
                  </Box>
                </NextLink>
              ))}
              {!isLoading && isLoggedIn && (
                <NextLink
                  href="/me"
                  style={{ color: 'inherit', textDecoration: 'none' }}
                  onClick={onClose}
                >
                  <Box
                    py={2}
                    px={3}
                    borderRadius="md"
                    fontSize="md"
                    fontWeight="medium"
                    _hover={{ bg: 'gray.100' }}
                  >
                    {user?.nickname ? `${user.nickname} 님` : '내 정보'}
                  </Box>
                </NextLink>
              )}
            </VStack>
          </DrawerBody>

          <DrawerFooter borderTop="1px solid" borderColor="gray.100">
            {!isLoading &&
              (isLoggedIn ? (
                <Button width="100%" variant="outline" onClick={handleLogout}>
                  로그아웃
                </Button>
              ) : (
                <Button width="100%" colorScheme="yellow" onClick={handleKakaoLogin}>
                  카카오 로그인
                </Button>
              ))}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Box>
  )
}

export default Navbar
