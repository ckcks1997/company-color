import React, { useState } from 'react';
import { Box, Heading, SimpleGrid, Text, Flex, Spinner } from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';

function Result() {
  const location = useLocation();
  const { searchResult } = location.state || {};
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const clickResult = async (hash) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/get_business_info?hash=${hash}`);
      const data = await response.json();
      navigate('/businessInfo', { state: { businessData: data } });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box p={8}>
      <Heading mb={4}>검색 결과</Heading>
      {searchResult && Object.keys(searchResult).length > 0 ? (
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
                   background="white"
                   onClick={() => clickResult(value.hash)}
                   cursor="pointer"
                   _hover={{ boxShadow: 'md' }}
              >
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