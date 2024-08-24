import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Heading,
  Text,
  Stack,
  Card,
  CardBody,
  StackDivider,
  CardHeader
} from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import EmployeeChart from "../components/EmployeeChart.jsx";

function BusinessInfo() {
  // businessData 최신순으로 정렬 후 state 저장
  const location = useLocation();
  const [businessData, setBusinessData] = useState(location.state.businessData?.sort((b, a) => new Date(a.created_dt) - new Date(b.created_dt)) || {})
  // businessData 중 최신데이터 1개 가져와서 state 저장
  const [latestBusinessData, setLatestBusinessData] = useState(businessData[0] ?? '')

  // 신규입사자, 퇴직자, 퇴사율 계산
  const totalNew = useMemo(() => {
    return businessData?.reduce((sum, item) => sum + item.subscriber_new, 0);
  }, [businessData])
  const totalQuit = useMemo(() => {
    return businessData?.reduce((sum, item) => sum + item.subscriber_quit, 0);
  }, [businessData])
  const quitRate = useMemo(() => {
    // subscriber_cnt 혹은 totalQuit가 없는경우 그냥 0 반환
    if (!latestBusinessData?.subscriber_cnt || !totalQuit) {
      return 0;
    }
    const rate = (totalQuit / latestBusinessData.subscriber_cnt) * 100;
    return Number(rate.toFixed(2));
  }, [latestBusinessData, totalQuit])

  return (
    <Card maxW='md'>
      <CardHeader>
        <Heading size='md'>회사 정보</Heading>
      </CardHeader>

      <CardBody>
        <Stack divider={<StackDivider />} spacing='4'>
          <Box>
            <Heading size='xs' textTransform='uppercase'>
              {latestBusinessData.company_nm}<small>({latestBusinessData.created_dt})</small>
            </Heading>
            <Text pt='2' fontSize='sm'>
              <p>전체 가입자수 :  {latestBusinessData.subscriber_cnt}</p>
              <p>12개월 입사자 수 : {totalNew}</p>
              <p>12개월 퇴사자 수 : {totalQuit}</p>
              <p>퇴사율: {quitRate} %</p>
            </Text>
          </Box>
          {businessData ? <EmployeeChart data={businessData} /> : '데이터가 없습니다.'}
        </Stack>
      </CardBody>
    </Card>
  );
}

export default BusinessInfo;