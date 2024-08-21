import React from 'react';
import {Box, Heading, SimpleGrid, Text, VStack, Flex} from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';

function Result() {
  const location = useLocation();
  const { searchResult } = location.state || {};

  const clickResult = async(value) =>{
    alert(value)
  }

  return (
    <Box p={8}>
      <Heading mb={4}>검색 결과</Heading>
      {searchResult ? (
        <Flex justifyContent="center" width="100%">
          <SimpleGrid columns={[1, 2]}
                      justifyItems="center"
                      width="100%"
                      maxWidth="1200px"
                      spacing='40px'
                      px={{ base: '20px', md: '40px' }}
          >
            {Object.entries(searchResult).map(([key, value]) => (
              <Box key={value.hash}
                   borderWidth={1}
                   borderRadius="md"
                   p={4}
                   width="100%"
                    maxW="100%"
                    onClick={() => clickResult(value.hash) }>
                <Text fontWeight="bold">{value.company_nm} <small>{value.location}</small></Text>
                <Text>{value.address}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Flex>
      ) : (
        <Text>검색 결과가 없습니다.</Text>
      )}
    </Box>
  );
}

export default Result;