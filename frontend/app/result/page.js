'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react';
import { Box, Heading, VStack, Flex, Input, Select,
  InputGroup, InputRightElement, IconButton
} from '@chakra-ui/react';
import { Search } from 'lucide-react';
import { regions } from "@/constants/regions.js";
import { useRouter } from 'next/navigation';
import SearchResultList from './SearchResultList';

export default function Result() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('business_name') || '');
  const [selectedRegion, setSelectedRegion] = useState(searchParams.get('location') || '');
  
  // 현재 URL에서 파라미터 추출
  const businessName = searchParams.get('business_name');
  const location = searchParams.get('location');
  const page = parseInt(searchParams.get('page') || '1', 10);

  const handleSearch = () => {
    if (!searchTerm.trim()) return;

    const params = new URLSearchParams();
    params.append('business_name', searchTerm);
    if (selectedRegion !== '') {
      params.append('location', selectedRegion);
    }
    router.push(`/result?${params.toString()}`);
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

        {businessName && (
          <SearchResultList 
            businessName={businessName} 
            location={location} 
            page={page} 
          />
        )}
      </VStack>
    </Box>
  );
}
