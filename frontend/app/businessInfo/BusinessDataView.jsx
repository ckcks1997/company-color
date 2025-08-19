'use client'

import { useEffect, useState, useMemo } from 'react';
import { 
  Box, Heading, Text, VStack, Card, CardBody, CardHeader,
  Divider, Center, Spinner, Button, HStack
} from '@chakra-ui/react';
import EmployeeChart from "./EmployeeChart";
import BounceText from "./BounceText";
import BusinessStats from "./BusinessStats";
import DartData from "./DartData";
import { useBusinessData } from '@/lib/hooks/useBusinessData';
import { api } from '@/lib/api/api';

export default function BusinessDataView({ hash }) {
  const [selectedPeriod, setSelectedPeriod] = useState(12);
  const { data: businessData, isLoading, error } = useBusinessData(hash, selectedPeriod);
  const [dartData, setDartData] = useState([]);
  const [latestBusinessData, setLatestBusinessData] = useState({});
  const [quitRate, setQuitRate] = useState(0);
  const [bgColor, setBgColor] = useState('gray.50');
  const [sortedData, setSortedData] = useState([]);

  // DART 데이터 가져오기
  const getDartData = async (name) => {
    if (name) {
      try {
        const data = await api.fetchDartData(name);
        setDartData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching dart data:', error);
        setDartData([]);
      }
    }
  };

  // 비즈니스 데이터가 로드되면 데이터 처리
  useEffect(() => {
    if (businessData && Array.isArray(businessData) && businessData.length > 0) {
      // 날짜순으로 정렬
      const sorted = [...businessData].sort(
        (a, b) => new Date(b.created_dt || 0) - new Date(a.created_dt || 0)
      );
      
      setSortedData(sorted);
      setLatestBusinessData(sorted[0] || {});
      
      // DART 데이터 가져오기
      if (sorted[0]?.company_nm) {
        getDartData(sorted[0].company_nm);
      }
      
      // 페이지 상단으로 스크롤
      window.scrollTo(0, 0);
    } else {
      setSortedData([]);
      setLatestBusinessData({});
    }
  }, [businessData]);

  // 퇴사율 및 배경색 계산
  const totalNew = useMemo(() => {
    if (!Array.isArray(sortedData) || sortedData.length === 0) return 0;
    return sortedData.reduce((sum, item) => sum + (item.subscriber_new || 0), 0);
  }, [sortedData]);

  const totalQuit = useMemo(() => {
    if (!Array.isArray(sortedData) || sortedData.length === 0) return 0;
    return sortedData.reduce((sum, item) => sum + (item.subscriber_quit || 0), 0);
  }, [sortedData]);

  const prevMonthNew = useMemo(() => {
    return sortedData[1]?.subscriber_new || 0;
  }, [sortedData]);

  const prevMonthQuit = useMemo(() => {
    return sortedData[1]?.subscriber_quit || 0;
  }, [sortedData]);

  const calculatePercentChange = (current, previous) => {
    current = current || 0;
    previous = previous || 0;
    
    if (previous === 0) {
      if (current === 0) return 0;
      return 100;
    }
    if (current === 0) return -100;
    return ((current - previous) / previous) * 100;
  };

  const newPercentChange = useMemo(() => {
    return calculatePercentChange(latestBusinessData?.subscriber_new, prevMonthNew);
  }, [latestBusinessData, prevMonthNew]);

  const quitPercentChange = useMemo(() => {
    return calculatePercentChange(latestBusinessData?.subscriber_quit, prevMonthQuit);
  }, [latestBusinessData, prevMonthQuit]);

  useEffect(() => {
    if (latestBusinessData?.subscriber_cnt && totalQuit) {
      // 퇴사율 계산 (2년 기간일 때는 연간 퇴사율로 환산)
      let rate = (totalQuit / latestBusinessData.subscriber_cnt) * 100;
      if (selectedPeriod === 24) {
        rate = rate / 2; // 2년 데이터를 연간 평균으로 환산
      }
      setQuitRate(Number(rate.toFixed(2)) || 0);

      // 배경색 설정 (연간 퇴사율 기준)
      const newBgColor = getBgColor(rate, latestBusinessData.subscriber_cnt);
      setTimeout(() => {
        setBgColor(newBgColor);
      }, 50);
    } else {
      setQuitRate(0);
    }
  }, [latestBusinessData, totalQuit, selectedPeriod]);

  const getBgColor = (rate, totalSubscriber) => {
    if (!totalSubscriber || totalSubscriber < 20) return '';
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

  const bgGradientColor = getBgGradientColor(quitRate, latestBusinessData?.subscriber_cnt);

  if (isLoading) {
    return (
      <Center minHeight="calc(100vh - 62px)">
        <Spinner color="#3182CE" size="xl" thickness="4px" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center minHeight="calc(100vh - 62px)">
        <Text color="red.500">데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.</Text>
      </Center>
    );
  }

  if (!businessData || !Array.isArray(businessData) || businessData.length === 0) {
    return (
      <Center minHeight="calc(100vh - 62px)">
        <Text>회사 정보를 찾을 수 없습니다.</Text>
      </Center>
    );
  }

  return (
    <Box bg={bgColor} bgGradient={bgGradientColor} minHeight="calc(100vh - 62px)" transition="all 2s ease">
      {quitRate > 100 && <BounceText />}
      <Box maxWidth="1000px" margin="auto" p={5}>
        <Card>
          <CardHeader>
            <VStack spacing={4} align="start">
              <Box>
                <Heading size='lg' color="blue.600">{latestBusinessData?.company_nm || '회사명 없음'}</Heading>
                <Text color="gray.500">최근 업데이트: {latestBusinessData?.created_dt || '-'}</Text>
                <Text color="gray.500">최초 등록일(추정 설립일): {latestBusinessData?.applied_date || '-'}</Text>
              </Box>
              
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>조회 기간 선택</Text>
                <HStack spacing={3}>
                  <Button
                    size="sm"
                    variant={selectedPeriod === 12 ? "solid" : "outline"}
                    colorScheme="blue"
                    onClick={() => setSelectedPeriod(12)}
                  >
                    1년
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedPeriod === 24 ? "solid" : "outline"}
                    colorScheme="blue"
                    onClick={() => setSelectedPeriod(24)}
                  >
                    2년
                  </Button>
                </HStack>
              </Box>
            </VStack>
          </CardHeader>

          <CardBody>
            <VStack spacing={6} align="stretch">
              <BusinessStats
                latestBusinessData={latestBusinessData || {}}
                totalNew={totalNew}
                totalQuit={totalQuit}
                newPercentChange={newPercentChange}
                quitPercentChange={quitPercentChange}
                quitRate={quitRate}
                selectedPeriod={selectedPeriod}
              />
              <Divider />

              <Box>
                <Heading size='md' mb={4}>직원 변동 추이</Heading>
                {sortedData.length > 0 ? (
                  <EmployeeChart data={sortedData} />
                ) : (
                  <Text>데이터가 없습니다.</Text>
                )}
              </Box>
            </VStack>
            <Divider />
          </CardBody>

          <CardBody>
            <VStack spacing={6} align="stretch">
              <Box>
                <Heading size='md' mb={4}>DART 문서 조회</Heading>
                {dartData && dartData.length > 0 ? (
                  <DartData data={dartData} />
                ) : (
                  <Text>DART 문서 데이터가 없습니다.</Text>
                )}
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
}
