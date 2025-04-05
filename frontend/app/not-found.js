'use client'

import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="calc(100vh - 150px)"
      p={4}
    >
      <VStack spacing={8} textAlign="center">
        <Heading as="h1" size="2xl" color="blue.600">
          404
        </Heading>
        <Heading as="h2" size="xl">
          페이지를 찾을 수 없습니다
        </Heading>
        <Text fontSize="lg" color="gray.600">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </Text>
        <Button 
          colorScheme="blue" 
          size="lg"
          onClick={() => router.push('/')}
        >
          홈으로 돌아가기
        </Button>
      </VStack>
    </Box>
  )
}
