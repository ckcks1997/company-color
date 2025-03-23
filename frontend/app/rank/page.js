'use client'

import {useRouter} from 'next/navigation'
import {useState, useEffect} from 'react';
import {
  Box, Heading, Flex, Input, Table, Thead, Tbody, Tr, Th, Td,
  InputGroup, InputRightElement, IconButton, Spinner, Text, ButtonGroup, Button,
  Badge, TableContainer, useBreakpointValue, Stack, useColorModeValue, HStack
} from '@chakra-ui/react';
import {Search, ChevronLeft, ChevronRight} from 'lucide-react';
import api from "@/lib/api/api.js";

function Result() {
  const router = useRouter()
  const [searchResult, setSearchResult] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchType, setSearchType] = useState('quit')
  const [searchTerm, setSearchTerm] = useState('2025-01')
  const today = new Date();
  today.setMonth(today.getMonth() - 2);
  const maxDate = today.toISOString().slice(0, 7);

  const isMobile = useBreakpointValue({ base: true, md: false });
  const tableSize = useBreakpointValue({ base: "sm", md: "md" });

  const headerBg = useColorModeValue('blue.50', 'blue.900');
  const stripedBg = useColorModeValue('gray.50', 'gray.700');
  const hoverBg = useColorModeValue('blue.50', 'blue.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    fetchData();
  }, [searchTerm, searchType]);

  const fetchData = async () => {
    const ymonth = searchTerm || maxDate

    if (ymonth) {
      setIsLoading(true)
      try {
        const data = await api.fetchRankResult(ymonth, searchType)
        setSearchResult(data)
      } catch (error) {
        console.error('Error fetching search results:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      fetchData()
    }
  }

  const getVisibleColumns = () => {
    if (isMobile) {
      return ['순위', '이름', searchType === 'quit' ? '퇴사자 수' : '입사자 수'];
    }
    return ['순위', '이름', '지역', '당월 사원수', '입사자 수', '퇴사자 수'];
  }

  const visibleColumns = getVisibleColumns();

  const changeMonth = (increment) => {
    const date = new Date(searchTerm + '-01');
    date.setMonth(date.getMonth() + increment);
    const newDate = date.toISOString().slice(0, 7);
    if (newDate >= '2023-07' && newDate <= maxDate) {
      setSearchTerm(newDate);
    }
  };

  const handleRowClick = (hash) => {
    if (hash) {
      router.push(`/businessInfo?hash=${hash}`);
    }
  };

  return (
    <Box p={{ base: 3, md: 8 }} maxWidth="1200px" margin="0 auto">
      <Heading mb={6} fontSize={{ base: "xl", md: "2xl" }} textAlign="left" >
        월별 입/퇴사자 수 순위 TOP 50
      </Heading>

      <Stack
        direction={{ base: "column", md: "row" }}
        spacing={4}
        mb={6}
        align="center"
      >
        <HStack>
          <IconButton
            icon={<ChevronLeft size={18} />}
            onClick={() => changeMonth(-1)}
            aria-label="Previous month"
          />
          <InputGroup size={isMobile ? "sm" : "md"} maxWidth={{ base: "100%", md: "300px" }}>
            <Input
              type="month"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleSearch}
              placeholder="YYYY-MM"
              min={'2023-07'}
              max={maxDate}
              lang="ko-KR"
            />
            <InputRightElement>
              <IconButton
                aria-label="Search"
                icon={<Search size={18} />}
                size="sm"
                onClick={fetchData}
              />
            </InputRightElement>
          </InputGroup>
          <IconButton
            icon={<ChevronRight size={18} />}
            onClick={() => changeMonth(1)}
            aria-label="Next month"
          />
        </HStack>

        <ButtonGroup size={isMobile ? "sm" : "md"} isAttached variant="outline" width={{ base: "100%", md: "auto" }}>
          <Button
            onClick={() => setSearchType('quit')}
            colorScheme={searchType === 'quit' ? "blue" : "gray"}
            flex="1"
          >
            퇴사율
          </Button>
          <Button
            onClick={() => setSearchType('new')}
            colorScheme={searchType === 'new' ? "blue" : "gray"}
            flex="1"
          >
            입사율
          </Button>
        </ButtonGroup>
      </Stack>

      {isLoading ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" color="blue.500" thickness="4px" />
        </Flex>
      ) : searchResult.length > 0 ? (
        <TableContainer
          overflowX="auto"
          borderRadius="md"
          boxShadow="sm"
          border="1px solid"
          borderColor={borderColor}
        >
          <Table
            variant="simple"
            size={tableSize}
            colorScheme="blue"
            style={{ borderCollapse: 'separate', borderSpacing: 0 }}
          >
            <Thead bg={headerBg}>
              <Tr>
                {visibleColumns.map((column) => (
                  <Th key={column} isNumeric={column.includes('수')}>{column}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {searchResult.map((item, index) => (
                <Tr
                  key={item.id || index}
                  _hover={{ bg: hoverBg, cursor: 'pointer' }}
                  bg={index % 2 === 1 ? stripedBg : 'transparent'}
                  onClick={() => handleRowClick(item.hash)}
                >
                  {visibleColumns.includes('순위') && (
                    <Td textAlign="center">
                      <Badge
                        colorScheme={index < 3 ? "blue" : "gray"}
                        borderRadius="full"
                        px={2}
                      >
                        {index + 1}
                      </Badge>
                    </Td>
                  )}
                  {visibleColumns.includes('이름') && (
                    <Td fontWeight={index < 5 ? "bold" : "normal"}>
                      <Text maxW={{ base: "150px", md: "100%" }} >
                        {item.company_nm}
                      </Text>
                    </Td>
                  )}
                  {visibleColumns.includes('지역') && (
                    <Td>
                      <Badge colorScheme="green" variant="subtle">
                        {item.business_location}
                      </Badge>
                    </Td>
                  )}
                  {visibleColumns.includes('당월 사원수') && (
                    <Td isNumeric>{item.subscriber_cnt.toLocaleString()}</Td>
                  )}
                  {visibleColumns.includes('입사자 수') && (
                    <Td isNumeric>
                      <HStack justifyContent="flex-end" spacing={1}>
                        <Text color={searchType === 'new' ? "green.500" : "inherit"} fontWeight={searchType === 'new' ? "bold" : "normal"}>
                          {item.subscriber_new.toLocaleString()}
                        </Text>
                        {searchType === 'new' && index < 3 && <Badge colorScheme="green">▲</Badge>}
                      </HStack>
                    </Td>
                  )}
                  {visibleColumns.includes('퇴사자 수') && (
                    <Td isNumeric>
                      <HStack justifyContent="flex-end" spacing={1}>
                        <Text color={searchType === 'quit' ? "red.500" : "inherit"} fontWeight={searchType === 'quit' ? "bold" : "normal"}>
                          {item.subscriber_quit.toLocaleString()}
                        </Text>
                        {searchType === 'quit' && index < 3 && <Badge colorScheme="red">▼</Badge>}
                      </HStack>
                    </Td>
                  )}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      ) : (
        <Text textAlign="center">검색 결과가 없습니다.</Text>
      )}
    </Box>
  );
}

export default Result
