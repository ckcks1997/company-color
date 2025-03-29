'use client'

import { useState, useEffect } from 'react';
import {
  Box, Heading, Flex, Input, IconButton, ButtonGroup, Button,
  Stack, HStack
} from '@chakra-ui/react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import RankTable from './RankTable';

export default function Rank() {
  const [searchType, setSearchType] = useState('quit');
  const [searchTerm, setSearchTerm] = useState('');
  
  // 기본값으로 2개월 전 날짜 설정
  useEffect(() => {
    const today = new Date();
    today.setMonth(today.getMonth() - 2);
    const defaultDate = today.toISOString().slice(0, 7);
    setSearchTerm(defaultDate);
  }, []);

  const maxDate = (() => {
    const today = new Date();
    today.setMonth(today.getMonth() - 2);
    return today.toISOString().slice(0, 7);
  })();

  const changeMonth = (increment) => {
    const date = new Date(searchTerm + '-01');
    date.setMonth(date.getMonth() + increment);
    const newDate = date.toISOString().slice(0, 7);
    if (newDate >= '2023-07' && newDate <= maxDate) {
      setSearchTerm(newDate);
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
          <Input
            type="month"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="YYYY-MM"
            min={'2023-07'}
            max={maxDate}
            lang="ko-KR"
            width={{ base: "100%", md: "200px" }}
          />
          <IconButton
            icon={<ChevronRight size={18} />}
            onClick={() => changeMonth(1)}
            aria-label="Next month"
          />
        </HStack>

        <ButtonGroup size={"md"} isAttached variant="outline" width={{ base: "100%", md: "auto" }}>
          <Button
            onClick={() => setSearchType('quit')}
            colorScheme={searchType === 'quit' ? "blue" : "gray"}
            flex="1"
          >
            퇴사자
          </Button>
          <Button
            onClick={() => setSearchType('new')}
            colorScheme={searchType === 'new' ? "blue" : "gray"}
            flex="1"
          >
            입사자
          </Button>
        </ButtonGroup>
      </Stack>

      {searchTerm && <RankTable ymonth={searchTerm} searchType={searchType} />}
    </Box>
  );
}
