'use client'

import { useState, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  Text,
} from '@chakra-ui/react'
import { FaSearch } from 'react-icons/fa'
import { regions } from '@/constants/regions'

function HomeSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRegion, setSelectedRegion] = useState<string>(regions[0].value)
  const router = useRouter()

  const handleSearch = () => {
    if (!searchTerm.trim()) return

    const params = new URLSearchParams()
    params.append('business_name', searchTerm)
    if (selectedRegion !== '') {
      params.append('location', selectedRegion)
    }
    router.push(`/result?${params.toString()}`)
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

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
          padding={{ base: '20px', md: '32px' }}
          alignContent="center"
          borderRadius="16px"
          bg="blackAlpha.200"
          backdropFilter="blur(14px)"
          border="1px solid"
          borderColor="whiteAlpha.300"
          boxShadow="0 8px 32px rgba(0, 0, 0, 0.4)"
        >
          <Flex mb={6} alignItems="center" direction="column">
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              align="center"
              color="white"
              fontWeight="semibold"
              textShadow="0 2px 8px rgba(0,0,0,0.9)"
            >
              약 850만+ 기업 데이터로 인사 트렌드를 한눈에
            </Text>
            <Text
              align="center"
              fontWeight={300}
              color="whiteAlpha.900"
              mt={1}
              textShadow="0 2px 8px rgba(0,0,0,0.9)"
            >
              무료로 기업의 인원 현황과 입/퇴사율을 파악하세요!
            </Text>
          </Flex>
          <Flex mb={4} direction={{ base: 'column', md: 'row' }}>
            <InputGroup size="md">
              <Input
                type="search"
                enterKeyHint="search"
                background="rgba(255,255,255,0.95)"
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
              width={{ base: '100%', md: '210px' }}
              mt={{ base: 2, md: 0 }}
              ml={{ base: 0, md: 2 }}
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              background="rgba(255,255,255,0.95)"
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
    </Flex>
  )
}

export default HomeSearch
