import React from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';

function Result() {
  const location = useLocation();
  const { searchResult } = location.state || {};

  return (
    <Box p={8}>
      <Heading mb={4}>검색 결과</Heading>
      {searchResult ? (
        <VStack align="stretch" spacing={4}>
          {Object.entries(searchResult).map(([key, value]) => (
            <Box key={key} borderWidth={1} borderRadius="md" p={4}>
              <Text fontWeight="bold">{key}:</Text>
              <Text>{JSON.stringify(value, null, 2)}</Text>
            </Box>
          ))}
        </VStack>
      ) : (
        <Text>검색 결과가 없습니다.</Text>
      )}
    </Box>
  );
}

export default Result;