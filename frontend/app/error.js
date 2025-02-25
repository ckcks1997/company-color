'use client'

import { useEffect } from 'react'
import { Box, Heading, Text, Button, VStack, Container } from "@chakra-ui/react"
import { css } from "@emotion/react"
import Link from 'next/link'

export default function Error({
  error,
  reset
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
      css={css`
        background-image: linear-gradient(to bottom right, #f7fafc, #edf2f7);
      `}
    >
      <Container maxW="lg">
        <VStack spacing={8} align="center" textAlign="center">
          <Heading
            as="h1"
            size="4xl"
            color="blue.500"
            css={css`
              text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
            `}
          >
            오류 발생
          </Heading>
          <Heading as="h2" size="xl" color="gray.700">
            문제가 발생했습니다
          </Heading>
          <Text color="gray.500" fontSize="lg">
            죄송합니다. 페이지를 로드하는 중 오류가 발생했습니다.
          </Text>
          <Button
            onClick={() => reset()}
            colorScheme="blue"
            size="lg"
            fontWeight="bold"
            mr={4}
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'lg',
            }}
            transition="all 0.2s"
          >
            다시 시도
          </Button>
          <Button
            as={Link}
            href="/"
            variant="outline"
            size="lg"
            fontWeight="bold"
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'lg',
            }}
            transition="all 0.2s"
          >
            홈으로 돌아가기
          </Button>
        </VStack>
      </Container>
    </Box>
  )
}