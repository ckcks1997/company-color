'use client'
import React from 'react';
import {SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Flex} from '@chakra-ui/react';
import InfoPopover from "./InfoPopover.jsx";

const BusinessStats = ({latestBusinessData, totalNew, totalQuit, newPercentChange, quitPercentChange, quitRate}) => {
  return (
    <SimpleGrid columns={[1, 2, 4]} spacing={4}>
      <Stat>
        <StatLabel>전체 가입자 수</StatLabel>
        <StatNumber>{latestBusinessData.subscriber_cnt.toLocaleString()}</StatNumber>
      </Stat>
      <Stat>
        <StatLabel>당월 / 12개월 입사자 수</StatLabel>
        <StatNumber>{latestBusinessData.subscriber_new}/{totalNew?.toLocaleString()}</StatNumber>
        <StatHelpText>
          <StatArrow type={newPercentChange >= 0 ? 'increase' : 'decrease'}/>
          전월 대비 {newPercentChange.toFixed(2)}%
        </StatHelpText>
      </Stat>
      <Stat>
        <StatLabel>당월 / 12개월 퇴사자 수</StatLabel>
        <StatNumber>{latestBusinessData.subscriber_quit}/{totalQuit?.toLocaleString()}</StatNumber>
        <StatHelpText>
          <StatArrow type={quitPercentChange >= 0 ? 'increase' : 'decrease'}/>
          전월 대비 {quitPercentChange.toFixed(2)}%
        </StatHelpText>
      </Stat>
      <Stat>
        <Flex alignItems="center">
          <StatLabel>퇴사율</StatLabel>
          <InfoPopover
            content="퇴사율 = (12개월 퇴사자 수 / 전체 가입자 수) * 100"
          />
        </Flex>
        <StatNumber>{quitRate}%</StatNumber>
      </Stat>
      <Stat>
        <Flex alignItems="center">
          <StatLabel>추정 연봉 평균</StatLabel>
          <InfoPopover
            content="국민연금 납부 금액을 기준으로 계산한 추정치이며, 이는 정확한 금액을 반영한 값이 아닙니다."
          />
        </Flex>
        <StatNumber>{(latestBusinessData.monthly_payment_amt / latestBusinessData.subscriber_cnt / 0.09 * 12 / 10000).toFixed(1)}만원</StatNumber>
      </Stat>
    </SimpleGrid>
  );
};

export default BusinessStats; 