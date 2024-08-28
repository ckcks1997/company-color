import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Heading, SimpleGrid, Text, Flex, Input, Button, VStack, HStack, Badge, Select, InputGroup, InputRightElement, IconButton } from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ClockLoader } from "react-spinners";
import { Search } from 'lucide-react';

const ITEMS_PER_PAGE = 30;

function Result() {
  const [searchResult, setSearchResult] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const location = useLocation();
  const navigate = useNavigate();
  const resultRef = useRef(null);

  const regions = [
    { key: '전체', value: '' },
    { key: '서울특별시', value: '서울특별시' },
    { key: '경기도', value: '경기도' },
    { key: '강원도', value: '강원특별자치도' },
    { key: '경상남도', value: '경상남도' },
    { key: '경상북도', value: '경상북도' },
    { key: '광주광역시', value: '광주광역시' },
    { key: '대구광역시', value: '대구광역시' },
    { key: '대전광역시', value: '대전광역시' },
    { key: '부산광역시', value: '부산광역시' },
    { key: '세종시', value: '세종특별자치시' },
    { key: '울산광역시', value: '울산광역시' },
    { key: '인천광역시', value: '인천광역시' },
    { key: '전라남도', value: '전라남도' },
    { key: '전라북도', value: '전라북도' },
    { key: '제주시', value: '제주특별자치도' },
    { key: '충청남도', value: '충청남도' },
    { key: '충청북도', value: '충청북도' },
  ];

  const fetchSearchResult = useCallback(async (businessName, locationParam, pageParam) => {
    setIsLoading(true);
    try {
      let searchUrl = `${import.meta.env.VITE_API_URL}/search_business?business_name=${businessName}`;
      if(locationParam){
        searchUrl += `&location=${locationParam}`;
      }
      if(pageParam){
        searchUrl += `&page=${pageParam}`;
      }
      const response = await fetch(searchUrl);
      const data = await response.json();

      setSearchResult(data);
      setTotalPages(1); //TODO: 페이징
    } catch (error) {
      alert('서버 통신 오류')
      setSearchResult([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, []);

   useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const businessName = searchParams.get('business_name');
    const locationParam = searchParams.get('location');
    const pageParam = searchParams.get('page');

    if (businessName) {
      setSearchTerm(businessName);
      setSelectedRegion(locationParam || '');
      setCurrentPage(pageParam ? parseInt(pageParam) : 1);
      fetchSearchResult(businessName, locationParam, pageParam);
    }
  }, [location.search]);

  const handleSearch = useCallback(() => {
    const searchParams = new URLSearchParams();
    searchParams.append('business_name', searchTerm);
    if (selectedRegion) {
      searchParams.append('location', selectedRegion);
    }
    searchParams.append('page', '1');
    navigate(`/result?${searchParams.toString()}`);
  }, [searchTerm, selectedRegion, navigate]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      const searchParams = new URLSearchParams(location.search);
      searchParams.set('page', newPage.toString());
      navigate(`/result?${searchParams.toString()}`);
      setCurrentPage(newPage);
    }
  };

  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return searchResult.slice(startIndex, endIndex);
  };

  const clickResult = (hash) => {
    navigate(`/businessInfo?hash=${hash}`, { state: { fromSearch: true } });
  };

  return (
    <Box p={8} maxWidth="1200px" margin="0 auto" ref={resultRef}>
      <VStack spacing={8} align="stretch">
        <Heading textAlign="center" color="green.600">검색 결과</Heading>

        <Box
          width="100%"
          maxWidth="500px"
          padding="20px"
          margin="0 auto"
        >
          <Flex direction={{ base: 'column', md: 'row' }}>
            <InputGroup size="md">
              <Input
                type="search"
                enterKeyHint="search"
                background={'rgba(255,255,255,0.95)'}
                borderRadius="full"
                placeholder="회사명을 입력하세요"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                fontSize="16px"
                pr="4.5rem"
              />
              <InputRightElement width="3.5rem">
                <IconButton
                  h="1.75rem"
                  size="sm"
                  onClick={handleSearch}
                  icon={<Search />}
                  aria-label="검색"
                  borderRadius="full"
                  background="transparent"
                />
              </InputRightElement>
            </InputGroup>
            <Select
              size="md"
              width={{ base: "100%", md: "210px" }}
              mt={{ base: 2, md: 0 }}
              ml={{ base: 0, md: 2 }}
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              background={'rgba(255,255,255,0.95)'}
              borderRadius="full"
              fontSize="16px"
            >
              {regions.map((region) => (
                <option key={region.value} value={region.value}>
                  {region.key}
                </option>
              ))}
            </Select>
          </Flex>
        </Box>

        {isLoading ? (
          <Flex justify="center" align="center" height="200px">
            <ClockLoader color="#3182CE" />
          </Flex>
        ) : searchResult.length > 0 ? (
          <>
            <SimpleGrid columns={[1, null, 2]} spacing={6}>
              {getPaginatedData().map((value) => (
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
                    <Heading size="md" color="green.600">{value.company_nm}</Heading>
                    <Badge colorScheme="green" alignSelf="flex-start">{value.location}</Badge>
                    <Text color="gray.600">{value.address}</Text>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
            <HStack justify="center" mt={6}>
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                isDisabled={currentPage === 1}
              >
                이전
              </Button>
              <Text>{currentPage} / {totalPages}</Text>
              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                isDisabled={currentPage === totalPages}
              >
                다음
              </Button>
            </HStack>
          </>
        ) : (
          <Text textAlign="center" fontSize="lg" color="gray.600">검색 결과가 없습니다.</Text>
        )}
      </VStack>
    </Box>
  );
}

export default Result;