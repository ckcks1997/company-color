'use client'

import { useState } from 'react'
import {
  Box,
  Button,
  ButtonGroup,
  HStack,
  Heading,
  IconButton,
  Input,
  Stack,
} from '@chakra-ui/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import RankTable from './RankTable'
import type { RankType } from '@/lib/api/types'

const getTwoMonthsAgo = (): string => {
  const today = new Date()
  today.setMonth(today.getMonth() - 2)
  return today.toISOString().slice(0, 7)
}

export default function Rank() {
  const [searchType, setSearchType] = useState<RankType>('quit')
  // 2개월 전 날짜를 기본값으로 lazy init (effect 없이 첫 렌더부터 확정)
  const [searchTerm, setSearchTerm] = useState<string>(() => getTwoMonthsAgo())

  const maxDate = getTwoMonthsAgo()

  const changeMonth = (increment: number) => {
    const date = new Date(searchTerm + '-01')
    date.setMonth(date.getMonth() + increment)
    const newDate = date.toISOString().slice(0, 7)
    if (newDate >= '2023-07' && newDate <= maxDate) {
      setSearchTerm(newDate)
    }
  }

  return (
    <Box p={{ base: 3, md: 8 }} maxWidth="1200px" margin="0 auto">
      <Heading
        mb={6}
        fontSize={{ base: 'xl', md: '2xl' }}
        textAlign="left"
        color="white"
        textShadow="0 2px 8px rgba(0,0,0,0.6)"
      >
        월별 입/퇴사자 수 순위 TOP 50
      </Heading>

      <Stack direction={{ base: 'column', md: 'row' }} spacing={4} mb={6} align="center">
        <HStack>
          <IconButton
            icon={<ChevronLeft size={18} />}
            onClick={() => changeMonth(-1)}
            aria-label="Previous month"
            bg="whiteAlpha.800"
            _hover={{ bg: 'whiteAlpha.900' }}
          />
          <Input
            type="month"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="YYYY-MM"
            min="2023-07"
            max={maxDate}
            lang="ko-KR"
            width={{ base: '100%', md: '200px' }}
            bg="whiteAlpha.800"
            backdropFilter="blur(8px)"
          />
          <IconButton
            icon={<ChevronRight size={18} />}
            onClick={() => changeMonth(1)}
            aria-label="Next month"
            bg="whiteAlpha.800"
            _hover={{ bg: 'whiteAlpha.900' }}
          />
        </HStack>

        <ButtonGroup
          size="md"
          isAttached
          variant="outline"
          width={{ base: '100%', md: 'auto' }}
        >
          <Button
            onClick={() => setSearchType('quit')}
            colorScheme={searchType === 'quit' ? 'blue' : 'gray'}
            flex="1"
          >
            퇴사자
          </Button>
          <Button
            onClick={() => setSearchType('new')}
            colorScheme={searchType === 'new' ? 'blue' : 'gray'}
            flex="1"
          >
            입사자
          </Button>
        </ButtonGroup>
      </Stack>

      {searchTerm && <RankTable ymonth={searchTerm} searchType={searchType} />}
    </Box>
  )
}
