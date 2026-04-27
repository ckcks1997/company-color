'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Badge,
  Box,
  Center,
  Heading,
  Spinner,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/hooks/useAuth'
import { useFavorites } from '@/lib/hooks/useFavorites'
import { listMyReplies } from '@/lib/api/me'
import FavoriteToggle from '@/components/FavoriteToggle'

export default function MyPage() {
  const router = useRouter()
  const { isLoggedIn, isLoading: authLoading, user } = useAuth()
  const { data: favorites, isLoading: favoritesLoading } = useFavorites(1, 30, isLoggedIn)
  const repliesQuery = useQuery({
    queryKey: ['me', 'replies'],
    queryFn: listMyReplies,
    enabled: isLoggedIn,
  })

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.replace('/')
    }
  }, [authLoading, isLoggedIn, router])

  if (authLoading || !isLoggedIn) {
    return (
      <Center minHeight="calc(100vh - 62px)">
        <Spinner size="xl" color="blue.500" />
      </Center>
    )
  }

  return (
    <Box maxWidth="1000px" mx="auto" p={6}>
      <Heading size="lg" mb={6}>
        {user?.nickname ? `${user.nickname} 님의 마이페이지` : '마이페이지'}
      </Heading>

      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>즐겨찾기</Tab>
          <Tab>내 댓글</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            {favoritesLoading ? (
              <Center py={10}>
                <Spinner />
              </Center>
            ) : !favorites || favorites.items.length === 0 ? (
              <Text color="gray.500">아직 즐겨찾기에 추가한 회사가 없습니다.</Text>
            ) : (
              <VStack spacing={3} align="stretch">
                {favorites.items.map((item) => (
                  <Box
                    key={item.hash}
                    borderWidth={1}
                    borderRadius="md"
                    p={4}
                    cursor="pointer"
                    _hover={{ bg: 'gray.50' }}
                    onClick={() => router.push(`/businessInfo?hash=${item.hash}`)}
                  >
                    <Stack direction="row" align="center" justify="space-between">
                      <Box>
                        <Text fontWeight="bold">{item.company_nm || '(이름 없음)'}</Text>
                        <Text fontSize="xs" color="gray.500">
                          {new Date(item.created_at).toLocaleDateString('ko-KR')} 추가
                        </Text>
                      </Box>
                      <FavoriteToggle hash={item.hash} companyNm={item.company_nm} />
                    </Stack>
                  </Box>
                ))}
              </VStack>
            )}
          </TabPanel>

          <TabPanel>
            {repliesQuery.isLoading ? (
              <Center py={10}>
                <Spinner />
              </Center>
            ) : !repliesQuery.data || repliesQuery.data.length === 0 ? (
              <Text color="gray.500">아직 작성한 댓글이 없습니다.</Text>
            ) : (
              <VStack spacing={3} align="stretch">
                {repliesQuery.data.map((reply) => (
                  <Box
                    key={reply.idx}
                    borderWidth={1}
                    borderRadius="md"
                    p={4}
                    cursor="pointer"
                    _hover={{ bg: 'gray.50' }}
                    onClick={() => router.push(`/businessInfo?hash=${reply.hash}`)}
                  >
                    <Stack direction="row" align="center" justify="space-between" mb={2}>
                      <Badge colorScheme="blue" fontSize="xs">
                        {reply.hash.slice(0, 12)}…
                      </Badge>
                      <Text fontSize="xs" color="gray.500">
                        {reply.created_at
                          ? new Date(reply.created_at).toLocaleDateString('ko-KR')
                          : ''}
                      </Text>
                    </Stack>
                    <Text>{reply.reply}</Text>
                  </Box>
                ))}
              </VStack>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}
