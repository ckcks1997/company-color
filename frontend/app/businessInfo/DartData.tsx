'use client'

import { Box, SimpleGrid, Text } from '@chakra-ui/react'
import type { DartDocument } from '@/lib/api/types'

interface DartDataProps {
  data: DartDocument[]
}

const DartData = ({ data }: DartDataProps) => {
  const handleClick = (rceptNo: string | undefined) => {
    if (!rceptNo) return
    const url = `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${rceptNo}`
    window.open(url, '_blank')
  }

  return (
    <SimpleGrid columns={[1]} spacing={4}>
      {data.map((value, index) => (
        <Box
          key={value.rcept_no || index}
          borderWidth={1}
          borderRadius="lg"
          p={6}
          boxShadow="md"
          bg="white"
          transition="all 0.3s"
          _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg', bg: 'gray.50' }}
          cursor="pointer"
          onClick={() => handleClick(value.rcept_no)}
        >
          <Text fontWeight="bold" fontSize="lg">
            📄 {value.report_nm}
          </Text>
          <Text color="gray.600">📅 일자: {value.rcept_dt}</Text>
          <Text color="blue.500" textDecoration="underline">
            🔗 새창 링크로 이동
          </Text>
        </Box>
      ))}
    </SimpleGrid>
  )
}

export default DartData
