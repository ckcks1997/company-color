'use client'
import {SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Flex} from '@chakra-ui/react';
import InfoPopover from "./InfoPopover.jsx";

const BusinessStats = ({latestBusinessData, totalNew, totalQuit, newPercentChange, quitPercentChange, quitRate, selectedPeriod}) => {
  // 안전하게 값을 표시하기 위한 도우미 함수
  const safeNumber = (value) => {
    return value !== undefined && value !== null ? value.toLocaleString() : '0';
  };

  // 기간에 따른 텍스트 반환
  const getPeriodText = () => {
    return selectedPeriod === 24 ? '24개월' : '12개월';
  };

  // 계산값이 유효한지 확인하고 표시하는 함수
  const safeCalculation = (payment, count) => {
    if (!payment || !count || count === 0) {
      return '0';
    }
    return ((payment / count / 0.09 * 12 / 10000).toFixed(1));
  };

  return (
    <SimpleGrid columns={[1, 2, 4]} spacing={4}>
      <Stat>
        <StatLabel>전체 가입자 수</StatLabel>
        <StatNumber>{safeNumber(latestBusinessData?.subscriber_cnt)}</StatNumber>
      </Stat>
      <Stat>
        <StatLabel>당월 / {getPeriodText()} 입사자 수</StatLabel>
        <StatNumber>{safeNumber(latestBusinessData?.subscriber_new)}/{safeNumber(totalNew)}</StatNumber>
        <StatHelpText>
          <StatArrow type={(newPercentChange || 0) >= 0 ? 'increase' : 'decrease'}/>
          전월 대비 {(newPercentChange || 0).toFixed(2)}%
        </StatHelpText>
      </Stat>
      <Stat>
        <StatLabel>당월 / {getPeriodText()} 퇴사자 수</StatLabel>
        <StatNumber>{safeNumber(latestBusinessData?.subscriber_quit)}/{safeNumber(totalQuit)}</StatNumber>
        <StatHelpText>
          <StatArrow type={(quitPercentChange || 0) >= 0 ? 'increase' : 'decrease'}/>
          전월 대비 {(quitPercentChange || 0).toFixed(2)}%
        </StatHelpText>
      </Stat>
      <Stat>
        <Flex alignItems="center">
          <StatLabel>퇴사율</StatLabel>
          <InfoPopover
            content={`퇴사율 = (${getPeriodText()} 퇴사자 수 / 전체 가입자 수) * 100`}
          />
        </Flex>
        <StatNumber>{quitRate || 0}%</StatNumber>
      </Stat>
      <Stat>
        <Flex alignItems="center">
          <StatLabel>추정 연봉 평균</StatLabel>
          <InfoPopover
            content="국민연금 납부 금액을 기준으로 계산한 추정치이며, 이는 정확한 금액을 반영한 값이 아닙니다."
          />
        </Flex>
        <StatNumber>
          {safeCalculation(
            latestBusinessData?.monthly_payment_amt, 
            latestBusinessData?.subscriber_cnt
          )}만원
        </StatNumber>
      </Stat>
    </SimpleGrid>
  );
};

export default BusinessStats;