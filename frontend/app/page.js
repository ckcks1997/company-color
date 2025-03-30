'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Flex, Input, Box, Select, Text, InputGroup, InputRightElement, IconButton,
  Heading, Divider, Link
} from '@chakra-ui/react';
import { FaSearch } from 'react-icons/fa';
import { regions } from "../constants/regions.js";
import MainRankTable from '../components/MainRankTable';
import api from '../lib/api/api';

function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState(regions[0].value);
  const [rankData, setRankData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ymonth, setYmonth] = useState('');

  const router = useRouter();

  useEffect(() => {
    // 전전월 데이터를 가져오기 위한 날짜 계산
    const today = new Date();
    today.setMonth(today.getMonth() - 2);
    const defaultDate = today.toISOString().slice(0, 7);
    setYmonth(defaultDate);

    // 입사자 순위 데이터 가져오기
    const fetchRankData = async () => {
      try {
        setIsLoading(true);
        const data = await api.fetchRankResult(defaultDate, 'new');
        setRankData(data);
      } catch (err) {
        console.error('Error fetching rank data:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankData();
  }, []);

  const handleSearch = () => {
    if (!searchTerm.trim()) return;

    const params = new URLSearchParams();
    params.append('business_name', searchTerm);
    if (selectedRegion !== '') {
      params.append('location', selectedRegion);
    }
    router.push(`/result?${params.toString()}`);
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
      alignItems="center"
      p={8}
      gap={8}
    >
      <Box
        width="100%"
        maxWidth="500px"
        minHeight="400px"
        padding="20px"
        alignContent="center"
        borderRadius="16px"
        background="url('/images/main_bg.jpg') no-repeat center center"
        backgroundSize="cover"
      >
        <Flex mb={4} alignItems='center' direction='column'>
          <Text
            fontSize='xl'
            align='center'
            color='white'
            textShadow='0 2px 4px rgba(0,0,0,1)'
          >
            약 850만+ 기업 데이터로 인사 트렌드를 한눈에
          </Text>
          <Text
            align='center'
            fontWeight={200}
            color='white'
            textShadow='0 2px 4px rgba(0,0,0,1)'
          >
            무료로 기업의 인원 현황과 입/퇴사율을 파악하세요!
          </Text>
        </Flex>
        <Flex mb={4} direction={{ base: 'column', md: 'row' }}>
          <InputGroup size="md">
            <Input
              type="search"
              enterKeyHint="search"
              background={'rgba(255,255,255,0.95)'}
              borderRadius="full"
              placeholder="회사명을 입력하세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              fontSize="16px"
              pr="4.5rem"
            />
            <InputRightElement width="3.5rem">
              <IconButton
                h="1.75rem"
                size="sm"
                onClick={handleSearch}
                icon={<FaSearch />}
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

      {/* 통계 순위 섹션 */}
      <Box width="100%" maxWidth="1200px">
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md">신규 입사자 상위 기업 TOP 10</Heading>
          <Text fontSize="sm" color="gray.500">
            {ymonth && `${ymonth} 기준`}
          </Text>
        </Flex>
        <Divider mb={6} />
        
        <MainRankTable 
          rankData={rankData} 
          isLoading={isLoading} 
          error={error} 
        />
        
        <Flex justify="flex-end" mt={4}>
          <Link 
            href="/rank" 
            color="blue.500" 
            fontSize="sm" 
            fontWeight="medium"
            _hover={{ textDecoration: 'underline' }}
          >
            더 많은 기업 순위 보기 →
          </Link>
        </Flex>
      </Box>
    </Flex>
  );
}

export default Home;