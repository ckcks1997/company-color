'use client'

import { useRouter } from 'next/navigation';
import {
  Table, Thead, Tbody, Tr, Th, Td,
  Spinner, Text, Badge, TableContainer,
  useBreakpointValue, useColorModeValue, HStack, Flex, Link
} from '@chakra-ui/react';

export default function MainRankTable({ rankData, isLoading, error }) {
  const router = useRouter();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const tableSize = useBreakpointValue({ base: "sm", md: "md" });

  const headerBg = useColorModeValue('blue.50', 'blue.900');
  const stripedBg = useColorModeValue('gray.50', 'gray.700');
  const hoverBg = useColorModeValue('blue.50', 'blue.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const getVisibleColumns = () => {
    if (isMobile) {
      return ['순위', '이름', '입사자 수'];
    }
    return ['순위', '이름', '지역', '당월 사원수', '입사자 수'];
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
      <Flex justify="center" align="center" height="100px">
        <Spinner size="md" color="blue.500" thickness="3px" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Text textAlign="center" color="red.500" fontSize="sm">
        데이터를 불러오는 중 오류가 발생했습니다.
      </Text>
    );
  }

  if (!rankData || !Array.isArray(rankData) || rankData.length === 0) {
    return (
      <Text textAlign="center" fontSize="sm">
        순위 데이터가 없습니다.
      </Text>
    );
  }

  // 최대 10개만 표시
  const displayData = rankData.slice(0, 10);

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
          {displayData.map((item, index) => (
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
                    <Text color="green.500" fontWeight="bold">
                      {safeNumber(item?.subscriber_new)}
                    </Text>
                    {index < 3 && <Badge colorScheme="green">▲</Badge>}
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
