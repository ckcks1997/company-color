'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  SimpleGrid, Box, VStack, Heading, Text, Badge, Flex,
  HStack, Button, Spinner
} from '@chakra-ui/react';
import { useSearchResults } from '@/lib/hooks/useSearchResults';
import GoogleAd from '@/components/GoogleAd';

export default function SearchResultList({ businessName, location, page }) {
  const router = useRouter();
  const { data: searchResult, isLoading, error } = useSearchResults(businessName, location, page);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= searchResult.total_pages) {
      // 현재 URL 파라미터를 유지하면서 페이지만 변경
      const params = new URLSearchParams();
      params.append('business_name', businessName);
      if (location) {
        params.append('location', location);
      }
      params.append('page', newPage.toString());
      router.push(`/result?${params.toString()}`);
    }
  };

  const handleResultClick = (hash) => {
    router.push(`/businessInfo?hash=${hash}`);
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="200px">
        <Spinner size="xl" color="#3182CE" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Text textAlign="center" fontSize="lg" color="red.500">
        데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.
      </Text>
    );
  }

  if (!searchResult?.items?.length) {
    return (
      <Text textAlign="center" fontSize="lg" color="gray.600">
        검색 결과가 없습니다.
      </Text>
    );
  }

  return (
    <>
      <SimpleGrid columns={[1, null, 2]} spacing={6}>
        {searchResult.items.map((value, index) => (
          <React.Fragment key={value.hash}>
            {/* 4번째 아이템 후에 광고 삽입 (최대 한 번만) */}
            {index === 4 && (
              <Box gridColumn="1 / -1" width="100%" my={4} id="ad-container-mid">
                {/*<GoogleAd */}
                {/*  slot="4919952478"*/}
                {/*  format="auto"*/}
                {/*  responsive={true}*/}
                {/*  style={{ display: 'block', textAlign: 'center' }}*/}
                {/*/>*/}
              </Box>
            )}
            <Box
              borderWidth={1}
              borderRadius="lg"
              p={6}
              boxShadow="md"
              bg="white"
              transition="all 0.3s"
              _hover={{transform: 'translateY(-5px)', boxShadow: 'lg'}}
              onClick={() => handleResultClick(value.hash)}
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
          </React.Fragment>
        ))}
      </SimpleGrid>
      
      {/* 결과 목록 하단 광고 */}
      <Box width="100%" my={6} id="ad-container-bottom">
        {/*<GoogleAd */}
        {/*  slot="4919952478"*/}
        {/*  format="autorelaxed"*/}
        {/*  responsive={true}*/}
        {/*  style={{ display: 'block', textAlign: 'center' }}*/}
        {/*/>*/}
      </Box>
      
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
  );
}
