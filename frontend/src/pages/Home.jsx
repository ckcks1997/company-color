import React, { useState } from 'react';
import {Flex, Input, Button, Box, Spinner, Select, Text} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';


function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
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

    const searchParams = new URLSearchParams();
    searchParams.append('business_name', searchTerm);
    if (selectedRegion !== '') {
      searchParams.append('location', selectedRegion);
    }
    navigate(`/result?${searchParams.toString()}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Flex
      direction="column"
      minHeight="calc(100vh - 112px)"
      justifyContent="center"
      alignItems="center"
      p={8}
    >
      <Box width="100%" maxWidth="500px">
        <Flex mb={4} alignItems='center' direction='column'>
          <Text fontSize='xl' align='center'>약 600만+ 기업 데이터로 인사 트렌드를 한눈에</Text>
          <Text align='center'>무료로 기업의 인원 현황과 입/퇴사율을 파악하세요!</Text>
        </Flex>
        <Flex mb={4}>
          <Input
            background={'rgba(255,255,255,0.95)'}
            borderRadius="full"
            placeholder="회사명을 입력하세요"
            size="md"
            mb={1}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            fontSize="16px"
          />
          <Select
            size="md"
            width="210px"
            ml={1}
            value={selectedRegion}
            defaultValue={regions[0].value}
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
        <Button
          onClick={handleSearch}
          colorScheme="blue"
          width="100%"
        >
          검색
        </Button>
      </Box>
    </Flex>
  );
}

export default Home;