import React from 'react';
import { Box, Heading, Text, Button, VStack, Container } from "@chakra-ui/react";
import { css } from "@emotion/react";
import {Link, useLocation} from 'react-router-dom';
function ErrorPage() {
  const location = useLocation();

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
            404
          </Heading>
          <Heading as="h2" size="xl" color="gray.700">
            페이지를 찾을 수 없습니다
          </Heading>
          <Text color="gray.500" fontSize="lg">
            요청하신 페이지를 찾을 수 없습니다.
          </Text>
          <Button
            as={Link}
            to="/"
            colorScheme="blue"
            size="lg"
            fontWeight="bold"
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'lg',
            }}
            transition="all 0.2s"
          >
            홈페이지로 돌아가기
          </Button>
        </VStack>
      </Container>
    </Box>
  );
}

export default ErrorPage;