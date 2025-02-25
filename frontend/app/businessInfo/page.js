'use client'

import {useEffect, useState, useMemo} from 'react'
import {useSearchParams} from 'next/navigation'
import {
  Box, Heading, Text, VStack, Card, CardBody, CardHeader,
   Divider, Center, Input, Button, Flex
} from '@chakra-ui/react'
import {ClockLoader} from "react-spinners"
import EmployeeChart from "./EmployeeChart"
import BounceText from "./BounceText"
import {api} from "@/lib/api/api"
import BusinessStats from "./BusinessStats"
import DartData from "./DartData"

export default function BusinessInfo() {
  const searchParams = useSearchParams()
  const [businessData, setBusinessData] = useState([])
  const [dartData, setDartData] = useState([])
  const [replyData, setReplyData] = useState([])
  const [latestBusinessData, setLatestBusinessData] = useState({})
  const [quitRate, setQuitRate] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [bgColor, setBgColor] = useState('gray.50')
  const [reply, setReply] = useState('')
  const hash = searchParams.get('hash');

  const fetchBusinessData = async () => {
    if (hash) {
      try {
        const data = await api.fetchBusinessData(hash)
        const sortedData = data.sort((b, a) => new Date(a.created_dt) - new Date(b.created_dt))
        setBusinessData(sortedData)
        setLatestBusinessData(sortedData[0] || {})
        await fetchDartData(sortedData[0].company_nm)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching business data:', error)
      }
    }
  }

  const fetchReplyData = async () => {
    if (hash) {
      try {
        const data = await api.fetchReplyData(hash)
        const replyArray = Array.isArray(data) ? data : data.items || []
        const sortedData = replyArray.sort((b, a) => new Date(a.idx) - new Date(b.idx))
        setReplyData(sortedData)
      } catch (error) {
        console.error('Error fetching reply data:', error)
        setReplyData([])
      }
    }
  }

  const fetchDartData = async (name) => {
    if (name) {
      try {
        const data = await api.fetchDartData(name)
        console.log(data)
        setDartData(data)
      } catch (error) {
        console.error('Error fetching dart data:', error)
        setDartData([])
      }
    }
  }

  useEffect(() => {
    setIsLoading(true)
    fetchBusinessData()
    fetchReplyData()
    window.scrollTo(0, 0)
  }, [hash])

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

      // 약간의 지연 후 배경색 변경
      setTimeout(() => {
        setBgColor(newBgColor);
      }, 50);

    } else {
      setQuitRate(0);
    }
  }, [latestBusinessData, totalQuit]);

  const getBgColor = (rate, totalSubscriber) => {
    if (totalSubscriber < 20) return '';
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

  const saveReply = async () => {
    try {
      await api.post('/reply', {
        'access_token': localStorage.getItem('access_token'),
        'hash': hash,
        'value': reply
      })
      alert('댓글이 등록되었습니다')
      setReply('')
      fetchReplyData()
    } catch (error) {
      alert('댓글 등록에 실패했습니다')
      console.error('Error:', error)
    }
  }

  if (isLoading) {
    return (
      <Center minHeight="100vh">
        <ClockLoader color="#3182CE"/>
      </Center>
    );
  }

  return (
    <Box bg={bgColor} bgGradient={bgGradientColor} minHeight="calc(100vh - 62px)" transition="all 2s ease">
      {quitRate > 100 && <BounceText/>}
      <Box maxWidth="1000px" margin="auto" p={5}>
        <Card>
          <CardHeader>
            <Heading size='lg' color="blue.600">{latestBusinessData.company_nm}</Heading>
            <Text color="gray.500">최근 업데이트: {latestBusinessData.created_dt}</Text>
            <Text color="gray.500">최초 등록일(추정 설립일): {latestBusinessData.applied_date}</Text>
          </CardHeader>

          <CardBody>
            <VStack spacing={6} align="stretch">
              <BusinessStats latestBusinessData={latestBusinessData}
                             totalNew={totalNew}
                             totalQuit={totalQuit}
                             newPercentChange={newPercentChange}
                             quitPercentChange={quitPercentChange}
                             quitRate={quitRate}
              />
              <Divider/>

              <Box>
                <Heading size='md' mb={4}>직원 변동 추이</Heading>
                {businessData.length > 0 ? <EmployeeChart data={businessData}/> : <Text>데이터가 없습니다.</Text>}
              </Box>
            </VStack>
            <Divider/>
          </CardBody>

          <CardBody>
            <VStack spacing={6} align="stretch">
              <Box>
                <Heading size='md' mb={4}>DART 문서 조회</Heading>
                {dartData.length > 0 ? <DartData data={dartData}/> : <Text>데이터가 없습니다.</Text>}
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </Box>
      <Box maxWidth="1000px" margin="auto" p={5} pt={0}>
        <Card>
          <CardBody>
            <Text>댓글</Text>
            {localStorage.getItem('access_token') ? (
              <Flex marginTop={2}>
                <Input
                  placeholder={"내용을 입력하세요."}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />
                <Button marginLeft={1} onClick={() => saveReply()}>등록</Button>
              </Flex>
            ) : (
              <Text color="gray.500" mt={2}>댓글을 작성하려면 로그인이 필요합니다.</Text>
            )}
            <Box display='flex' flexDirection='column'>
              {replyData.map((val, index) => (
                <Box key={val.idx} display='inline' p={3}>
                  <Text>익명 {index + 1}</Text>
                  <Text>{val.reply}</Text>
                </Box>
              ))}
            </Box>
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
}
