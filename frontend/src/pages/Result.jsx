import React, { useState, useEffect, useRef } from 'react';
import { Box, Heading, SimpleGrid, Text, Flex, Input, Button, VStack, HStack, Badge } from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ClockLoader } from "react-spinners";
import { Search } from 'lucide-react';


let globalSearchResult = null;
let globalScrollPosition = 0;

function Result() {
  const [searchResult, setSearchResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const resultRef = useRef(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const businessName = searchParams.get('business_name');

    if (businessName) {
      setSearchTerm(businessName);
      if (globalSearchResult) {
        setSearchResult(globalSearchResult);
        setTimeout(() => {
          window.scrollTo(0, globalScrollPosition);
        }, 0);
      } else {
        fetchSearchResult(businessName);
      }
    }
  }, [location.search]);

  useEffect(() => {
    return () => {
      if (resultRef.current) {
        globalScrollPosition = window.pageYOffset;
      }
    };
  }, []);

  const fetchSearchResult = async (businessName) => {
    setIsLoading(true);
    try {
      const searchUrl = `${import.meta.env.VITE_API_URL}/search_business?business_name=${businessName}`;
      const response = await fetch(searchUrl);
      const data = await response.json();
      setSearchResult(data);
      globalSearchResult = data;
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clickResult = (hash) => {
    globalScrollPosition = window.pageYOffset;
    navigate(`/businessInfo?hash=${hash}`, { state: { fromSearch: true } });
  }

  const handleSearch = () => {
    globalSearchResult = null; // 새로운 검색 시 기존 결과 초기화
    navigate(`/result?business_name=${searchTerm}`);
  }

  return (
    <Box p={8} maxWidth="1200px" margin="0 auto" ref={resultRef}>
      <VStack spacing={8} align="stretch">
        <Heading mb={4} textAlign="center" color="blue.600">검색 결과</Heading>

        <HStack as="form" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="비즈니스 이름 검색..."
            size="lg"
          />
          <Button leftIcon={<Search />} colorScheme="blue" size="lg" onClick={handleSearch}>
            검색
          </Button>
        </HStack>

        {isLoading ? (
          <Flex justify="center" align="center" height="200px">
            <ClockLoader color="#3182CE" />
          </Flex>
        ) : searchResult && Object.keys(searchResult).length > 0 ? (
          <SimpleGrid columns={[1, null, 2]} spacing={6}>
            {Object.entries(searchResult).map(([key, value]) => (
              <Box
                key={value.hash}
                borderWidth={1}
                borderRadius="lg"
                p={6}
                boxShadow="md"
                bg="white"
                transition="all 0.3s"
                _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
                onClick={() => clickResult(value.hash)}
                cursor="pointer"
              >
                <VStack align="stretch" spacing={3}>
                  <Heading size="md" color="blue.600">{value.company_nm}</Heading>
                  <Badge colorScheme="green" alignSelf="flex-start">{value.location}</Badge>
                  <Text color="gray.600">{value.address}</Text>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        ) : (
          <Text textAlign="center" fontSize="lg" color="gray.600">검색 결과가 없습니다.</Text>
        )}
      </VStack>
    </Box>
  );
}

export default Result;