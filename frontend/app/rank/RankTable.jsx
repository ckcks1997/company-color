'use client'

import { useRouter } from 'next/navigation';
import {
  Table, Thead, Tbody, Tr, Th, Td,
  Spinner, Text, Badge, TableContainer,
  useBreakpointValue, useColorModeValue, HStack, Flex
} from '@chakra-ui/react';
import { useRankData } from '@/lib/hooks/useRankData';

export default function RankTable({ ymonth, searchType }) {
  const router = useRouter();
  const { data: rankData, isLoading, error } = useRankData(ymonth, searchType);

  const isMobile = useBreakpointValue({ base: true, md: false });
  const tableSize = useBreakpointValue({ base: "sm", md: "md" });

  const headerBg = useColorModeValue('blue.50', 'blue.900');
  const stripedBg = useColorModeValue('gray.50', 'gray.700');
  const hoverBg = useColorModeValue('blue.50', 'blue.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const getVisibleColumns = () => {
    if (isMobile) {
      return ['순위', '이름', searchType === 'quit' ? '퇴사자 수' : '입사자 수'];
    }
    return ['순위', '이름', '지역', '당월 사원수', '입사자 수', '퇴사자 수'];
  };

  const visibleColumns = getVisibleColumns();

  const handleRowClick = (hash) => {
    if (hash) {
      router.push(`/businessInfo?hash=${hash}`);
    }
  };

  // 안전한 표시를 위한 도우미 함수
  const safeNumber = (value) => {
    return value !== undefined && value !== null ? value.toLocaleString() : '0';
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="200px">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Text textAlign="center" color="red.500">
        데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.
      </Text>
    );
  }

  if (!rankData || !Array.isArray(rankData) || rankData.length === 0) {
    return (
      <Text textAlign="center">
        해당 월의 순위 데이터가 없습니다.
      </Text>
    );
  }

  return (
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
          {rankData.map((item, index) => (
            <Tr
              key={item?.hash || index}
              _hover={{ bg: hoverBg, cursor: 'pointer' }}
              bg={index % 2 === 1 ? stripedBg : 'transparent'}
              onClick={() => handleRowClick(item?.hash)}
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
                    {item?.company_nm || ''}
                  </Text>
                </Td>
              )}
              {visibleColumns.includes('지역') && (
                <Td>
                  <Badge colorScheme="green" variant="subtle">
                    {item?.business_location || '-'}
                  </Badge>
                </Td>
              )}
              {visibleColumns.includes('당월 사원수') && (
                <Td isNumeric>{safeNumber(item?.subscriber_cnt)}</Td>
              )}
              {visibleColumns.includes('입사자 수') && (
                <Td isNumeric>
                  <HStack justifyContent="flex-end" spacing={1}>
                    <Text color={searchType === 'new' ? "green.500" : "inherit"} fontWeight={searchType === 'new' ? "bold" : "normal"}>
                      {safeNumber(item?.subscriber_new)}
                    </Text>
                    {searchType === 'new' && index < 3 && <Badge colorScheme="green">▲</Badge>}
                  </HStack>
                </Td>
              )}
              {visibleColumns.includes('퇴사자 수') && (
                <Td isNumeric>
                  <HStack justifyContent="flex-end" spacing={1}>
                    <Text color={searchType === 'quit' ? "red.500" : "inherit"} fontWeight={searchType === 'quit' ? "bold" : "normal"}>
                      {safeNumber(item?.subscriber_quit)}
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
  );
}
