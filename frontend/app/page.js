'use client'

import React, {useState} from 'react';
import { useRouter, useSearchParams } from 'next/navigation'

import { Flex, Input, Box, Select, Text, InputGroup, InputRightElement, IconButton} from '@chakra-ui/react';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { regions } from "../constants/regions.js";
import 'swiper/css';
import 'swiper/css/pagination';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';

function Home() {

  const [searchTerm, setSearchTerm] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(regions[0].value);

  const router = useRouter()
  const searchParams = useSearchParams()

  //  useEffect(() => {
  //   // 최근 검색 목록을 가져오는 API 호출
  //   const fetchRecentSearches = async () => {
  //     try {
  //       const response = await fetch(`${import.meta.env.VITE_API_URL}/get_recent_search`);
  //       const data = await response.json();
  //       setRecentSearches(data);
  //     } catch (error) {
  //       console.error('error', error);
  //     }
  //   };
  //   fetchRecentSearches();
  // }, []);

  const handleSearch = () => {
    if (!searchTerm.trim()) return;

    const params = new URLSearchParams()
    params.append('business_name', searchTerm)
    if (selectedRegion !== '') {
      params.append('location', selectedRegion)
    }
    router.push(`/result?${params.toString()}`)
  }

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
      {recentSearches.length > 0 && (
        <Box width="100%" maxWidth="800px" marginTop="20px">
          <Text fontSize="xl" fontWeight="bold" mb={4}>
            최근 검색 기업
          </Text>
          <Swiper
            modules={[Pagination]}
            style={{paddingBottom: "40px"}}
            pagination={{
              clickable: true,
            }}
            breakpoints={{
              // 화면 너비가 0px 이상일 때
              0: {
                slidesPerView: 1,
                spaceBetween: 10,
              },
              // 화면 너비가 480px 이상일 때
              480: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              // 화면 너비가 768px 이상일 때
              768: {
                slidesPerView: 3,
                spaceBetween: 30,
              },
            }}
          >
            {/*{recentSearches.map((company, index) => (*/}
            {/*  <SwiperSlide key={index}>*/}
            {/*    <Box*/}
            {/*      borderWidth="1px"*/}
            {/*      borderRadius="lg"*/}
            {/*      overflow="hidden"*/}
            {/*      p={4}*/}
            {/*      textAlign="center"*/}
            {/*      cursor="pointer"*/}
            {/*      onClick={() => navigate(`/businessInfo?hash=${company.hash}`)}*/}
            {/*    >*/}
            {/*      <Text fontWeight="bold">{company.company_nm}</Text>*/}
            {/*      <Text fontSize="sm">{company.business_location}</Text>*/}
            {/*    </Box>*/}
            {/*  </SwiperSlide>*/}
            {/*))}*/}
          </Swiper>
        </Box>
      )}
    </Flex>
  );
}

export default Home;