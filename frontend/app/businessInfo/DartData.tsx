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
          borderColor="gray.100"
          borderRadius="2xl"
          p={6}
          boxShadow="0 1px 2px rgba(0, 0, 0, 0.04)"
          bg="whiteAlpha.700"
          backdropFilter="blur(10px)"
          transition="all 0.25s ease"
          _hover={{ transform: 'translateY(-3px)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',   bg: 'whiteAlpha.900' }}
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
