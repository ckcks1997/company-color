'use client'

import {useRouter, useSearchParams} from 'next/navigation'
import React, {useState, useEffect, useRef, useCallback} from 'react';
import {Box, Heading, SimpleGrid, Text, Flex, Input,
  Button, VStack, HStack, Badge, Select, InputGroup, InputRightElement, IconButton
} from '@chakra-ui/react';
import {ClockLoader} from "react-spinners";
import {Search} from 'lucide-react';
import {regions} from "@/constants/regions.js";
import api from "@/lib/api/api.js";

function Result() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchResult, setSearchResult] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('business_name') || '')
  const [selectedRegion, setSelectedRegion] = useState(searchParams.get('location') || '')

  useEffect(() => {
    async function fetchData() {
      const businessName = searchParams.get('business_name')
      const location = searchParams.get('location')
      const page = searchParams.get('page')

      if (businessName) {
        setIsLoading(true)
        try {
          const data = await api.fetchSearchResult(businessName, location, page)
          setSearchResult(data)
        } catch (error) {
          console.error('Error fetching search results:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchData()
  }, [searchParams])


  const handleSearch = () => {
    if (!searchTerm.trim()) return

    const params = new URLSearchParams()
    params.append('business_name', searchTerm)
    if (selectedRegion !== '') {
      params.append('location', selectedRegion)
    }
    router.push(`/result?${params.toString()}`)
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= searchResult.total_pages) {
      const searchParams = new URLSearchParams(location.search);
      searchParams.set('page', newPage.toString());
      router.push(`/result?${searchParams.toString()}`);
    }
  };

  const clickResult = (hash) => {
    router.push(`/businessInfo?hash=${hash}`, {state: {fromSearch: true}});
  };

  return (
    <Box p={8} maxWidth="1200px" margin="0 auto">
      <VStack spacing={8} align="stretch">
        <Heading textAlign="center" color="blue.600">검색 결과</Heading>

        <Box
          width="100%"
          maxWidth="500px"
          padding="20px"
          margin="0 auto"
        >
          <Flex direction={{base: 'column', md: 'row'}}>
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
                  icon={<Search/>}
                  aria-label="검색"
                  borderRadius="full"
                  background="transparent"
                />
              </InputRightElement>
            </InputGroup>
            <Select
              size="md"
              width={{base: "100%", md: "210px"}}
              mt={{base: 2, md: 0}}
              ml={{base: 0, md: 2}}
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
            <ClockLoader color="#3182CE"/>
          </Flex>
        ) : searchResult.items?.length > 0 ? (
          <>
            <SimpleGrid columns={[1, null, 2]} spacing={6}>
              {searchResult.items.map((value) => (
                <Box
                  key={value.hash}
                  borderWidth={1}
                  borderRadius="lg"
                  p={6}
                  boxShadow="md"
                  bg="white"
                  transition="all 0.3s"
                  _hover={{transform: 'translateY(-5px)', boxShadow: 'lg'}}
                  onClick={() => clickResult(value.hash)}
                  cursor="pointer"
                >
                  <VStack align="stretch" spacing={3}>
                    <Heading size="md" color="blue.600">{value.company_nm}</Heading>
                    <Flex alignItems="center" justifyContent="space-between">
                      <Badge colorScheme="blue">{value.location}</Badge>
                      <Text fontSize="0.8rem" color="gray.600">전체 가입자 수: {value.subscriber} 명</Text>
                    </Flex>
                    <Text fontSize="0.9rem" color="gray.600">{value.address}</Text>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
            <HStack justify="center" mt={6}>
              <Button
                onClick={() => handlePageChange(searchResult.page - 1)}
                isDisabled={searchResult.page === 1}
              >
                이전
              </Button>
              <Text>{searchResult.page} / {searchResult.total_pages}</Text>
              <Button
                onClick={() => handlePageChange(searchResult.page + 1)}
                isDisabled={searchResult.page === searchResult.total_pages}
              >
                다음
              </Button>
            </HStack>
            <Text textAlign="center" color="gray.600">
              총 {searchResult.total_count}개의 결과
            </Text>
          </>
        ) : (
          <Text textAlign="center" fontSize="lg" color="gray.600">검색 결과가 없습니다.</Text>
        )}
      </VStack>
    </Box>
  );
}

export default Result;