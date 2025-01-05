import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Heading, Text, VStack, Card, CardBody, CardHeader, Stat, StatLabel,
  StatNumber, StatHelpText, StatArrow, SimpleGrid, Divider, Center,
  Input, Button
} from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import { Flex } from '@chakra-ui/react';
import { ClockLoader } from "react-spinners";
import EmployeeChart from "../components/EmployeeChart.jsx";
import InfoPopover from "../components/InfoPopover.jsx";
import BounceText from "../components/BounceText.jsx";
import {api} from "../api/api.js"

function BusinessInfo() {
  const location = useLocation();
  const [businessData, setBusinessData] = useState([]);
  const [latestBusinessData, setLatestBusinessData] = useState({});
  const [quitRate, setQuitRate] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [bgColor, setBgColor] = useState('gray.50');
  const [finalBgColor, setFinalBgColor] = useState('');

  useEffect(() => {
    setIsLoading(true);
    const fetchBusinessData = async () => {
      const searchParams = new URLSearchParams(location.search);
      const hash = searchParams.get('hash');

      if (hash) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/get_business_info?hash=${hash}`);
          const data = await response.json();
          const sortedData = data.sort((b, a) => new Date(a.created_dt) - new Date(b.created_dt));
          setBusinessData(sortedData);
          setLatestBusinessData(sortedData[0] || {});
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching business data:', error);
        }
      }
    };
    fetchBusinessData();
    window.scrollTo(0, 0);
  }, [location.search]);

  const totalNew = useMemo(() => {
    return businessData?.reduce((sum, item) => sum + item.subscriber_new, 0);
  }, [businessData]);

  const totalQuit = useMemo(() => {
    return businessData?.reduce((sum, item) => sum + item.subscriber_quit, 0);
  }, [businessData]);

  const prevMonthNew = useMemo(() => {
    return businessData[1]?.subscriber_new || 0;
  }, [businessData]);

  const prevMonthQuit = useMemo(() => {
    return businessData[1]?.subscriber_quit || 0;
  }, [businessData]);

  const calculatePercentChange = (current, previous) => {
    if (previous === 0) {
      if (current === 0) return 0;
      return 100 * current;
    }
    if (current === 0) return -100;
    return ((current - previous) / previous) * 100;
  };

  const newPercentChange = useMemo(() => {
    return calculatePercentChange(latestBusinessData.subscriber_new, prevMonthNew);
  }, [latestBusinessData, prevMonthNew]);

  const quitPercentChange = useMemo(() => {
    return calculatePercentChange(latestBusinessData.subscriber_quit, prevMonthQuit);
  }, [latestBusinessData, prevMonthQuit]);


  useEffect(() => {
    if (latestBusinessData?.subscriber_cnt && totalQuit) {
      // 퇴사율 계산
      const rate = (totalQuit / latestBusinessData.subscriber_cnt) * 100;
      setQuitRate(Number(rate.toFixed(2)));

      // 배경색 트랜지션
      const newBgColor = getBgColor(rate, latestBusinessData.subscriber_cnt);
      setFinalBgColor(newBgColor);

      // 약간의 지연 후 배경색 변경
      setTimeout(() => {
        setBgColor(newBgColor);
      }, 50);

    } else {
      setQuitRate(0);
    }
  }, [latestBusinessData, totalQuit]);

  const getBgColor = (rate, totalSubscriber) => {
    if(totalSubscriber < 20) return '';
    else if (rate < 15) return 'blue.400';
    else if (rate < 20) return 'green.100';
    else if (rate < 30) return 'orange.100';
    else if (rate < 50) return 'red.200';
    else if (rate < 70) return 'red.300';
    else if (rate < 100) return 'red.400';
    return '#111';
  };

  const getBgGradientColor = (rate, totalSubscriber) => {
    if (totalSubscriber > 50 && rate < 10) return 'linear(to-t, #FFD1DC, #FFE5B4, #E1FFB1, #B1FFFD, #CAB1FF)';
    else return '';
  };

  const bgGradientColor = getBgGradientColor(quitRate, latestBusinessData.subscriber_cnt);

  const saveReply = () =>{
    api.post('/reply', {
      'access_token': '',
      'hash': '',
      'value': ''
    });
  }

  if (isLoading) {
    return (
      <Center minHeight="100vh">
        <ClockLoader color="#3182CE" />
      </Center>
    );
  }

  return (
    <Box bg={bgColor} bgGradient={bgGradientColor} minHeight="calc(100vh - 62px)" transition="all 2s ease">
      {quitRate > 100 && <BounceText />}
      <Box maxWidth="1000px" margin="auto" p={5}>
        <Card>
          <CardHeader>
            <Heading size='lg' color="blue.600">{latestBusinessData.company_nm}</Heading>
            <Text color="gray.500">최근 업데이트: {latestBusinessData.created_dt}</Text>
            <Text color="gray.500">최초 등록일(추정 설립일): {latestBusinessData.applied_date}</Text>
          </CardHeader>

          <CardBody>
            <VStack spacing={6} align="stretch">
              <SimpleGrid columns={[1, 2, 4]} spacing={4}>
                <Stat>
                  <StatLabel>전체 가입자 수</StatLabel>
                  <StatNumber>{latestBusinessData.subscriber_cnt.toLocaleString()}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>당월 / 12개월 입사자 수</StatLabel>
                  <StatNumber>{latestBusinessData.subscriber_new}/{totalNew?.toLocaleString()}</StatNumber>
                  <StatHelpText>
                    <StatArrow type={newPercentChange >= 0 ? 'increase' : 'decrease'} />
                    전월 대비 {newPercentChange.toFixed(2)}%
                  </StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>당월 / 12개월 퇴사자 수</StatLabel>
                  <StatNumber>{latestBusinessData.subscriber_quit}/{totalQuit?.toLocaleString()}</StatNumber>
                  <StatHelpText>
                    <StatArrow type={quitPercentChange >= 0 ? 'increase' : 'decrease'} />
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

              <Divider />

              <Box>
                <Heading size='md' mb={4}>직원 변동 추이</Heading>
                {businessData.length > 0 ? <EmployeeChart data={businessData} /> : <Text>데이터가 없습니다.</Text>}
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </Box>
      <Box maxWidth="1000px" margin="auto" p={5} pt={0}>
        <Card>
          <CardBody>
            <Text>댓글</Text>
            <Flex marginTop={2}>
              <Input placeholder={"내용을 입력하세요."}></Input>
              <Button marginLeft={1} onClick={() => saveReply()}>등록</Button>
            </Flex>
            <Box>

            </Box>
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
}

export default BusinessInfo;