import React, { useState } from 'react';
import {Flex, Input, Button, Box, Spinner, Select} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';


function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    try {
      let searchUrl = `${import.meta.env.VITE_API_URL}/search_business?business_name=${searchTerm}`
      if (selectedRegion !== '') {
        searchUrl += `&location=${selectedRegion}`;
      }
      let response = await fetch(searchUrl);
      const data = await response.json();
      navigate('/result', { state: { searchResult: data } });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }else {
    return (
      <Flex
        direction="column"
        minHeight="calc(100vh - 112px)"
        justifyContent="center"
        alignItems="center"
        p={8}
      >
        <Box width="100%" maxWidth="500px">
          <Flex mb={4}>
            <Input
              background={'rgba(255,255,255,0.95)'}
              borderRadius="full"
              placeholder="검색어를 입력하세요"
              size="md"
              mb={1}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              fontSize="xs"
            />
            <Select
              placeholder="지역 선택"
              size="md"
              width="200px"
              ml={1}
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              background={'rgba(255,255,255,0.95)'}
              borderRadius="full"
              fontSize="xs"
            >
              {regions.map((region) => (
                <option key={region.value} value={region.value}>
                  {region.key}
                </option>
              ))}
            </Select>
          </Flex>
          <Button
            onClick={handleSearch}
            colorScheme="blue"
            width="100%"
            disabled={isLoading}
          >
            {isLoading ? <Spinner size="sm"/> : '검색'}
          </Button>
        </Box>
      </Flex>
    );
  }
}

export default Home;