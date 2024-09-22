import React, { useState } from 'react';
import {Flex, Input, Box, Select, Text, InputGroup, InputRightElement, IconButton, VStack} from '@chakra-ui/react';
import { FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import {Heading1} from "lucide-react";


function SiteInfo() {

  const infoText = `
COMPANY COLOR 사이트는 신뢰할 수 있는 국민연금 데이터를 기반으로 기업 정보를 제공합니다.
  
  - 기업의 현재 인원 규모
  - 최근 입사자 및 퇴사자 동향
  - 예상 평균 연봉 데이터
  
이를 통해 구직자들은 관심 있는 기업의 현황을 파악하고, 보다 정확한 정보를 바탕으로 취업 전략을 수립할 수 있습니다.
COMPANY COLOR 사이트와 함께 더 스마트한 구직 활동을 시작하세요!

* 참고사항:
  - 공무원의 경우 국민연금이 아닌 공무원연금 가입자로 분류되어 조회되지 않습니다.
  - 국민연금을 납부하지 않는 사업자의 경우 조회되지 않거나 실제 인원보다 낮게 표시될 수 있습니다.

  `

  const siteFunction = `
기업명과 지역을 기반으로 기업 조회가 가능하며, 기업의 상세정보 페이지에서는 해당 기업의 퇴사율에 따라 배경의 색이 변하게 됩니다.
(무지개, 파랑, 초록, 노랑, 빨강, 블랙 순입니다.)

하지만 이는 해당 기업의 질을 평가하는 절대적인 수치나 방법은 아니며, 직종에 따라 퇴사율이 과도하게 높게 잡히거나 낮게 잡힐 수 있습니다.
  `

  const policyText = `
    1. 개인정보의 처리 목적
    COMPANY COLOR은(는) 다음의 목적을 위하여 개인정보를 처리하고 있으며, 
    다음의 목적 이외의 용도로는 이용하지 않습니다.
     - 웹사이트 이용 현황 및 통계 분석
     - 시스템 부정 이용 방지
    
    2. 처리하는 개인정보의 항목
    COMPANY COLOR은(는) 서비스 이용 과정에서 아래와 같은 정보들이 생성되어 수집될 수 있습니다.
     - 접속 로그
        - 접속 IP 정보
        - 브라우저 종류
        - 운영체제 종류
        - 사이트내 방문 페이지
     - 시스템 사용 환경
    
    3. 개인정보의 이용목적
    COMPANY COLOR은(는) 수집한 개인정보를 다음의 목적을 위해 활용합니다.
    - 접속 로그, 접속 IP 정보, 브라우저 종류, 운영체제 종류: 부정 이용 방지를 위해 사용
    - 시스템 사용 환경: 사용자의 시스템 통계 및 접속 환경 확인
    
    4. Google Analytics 사용 안내
    본 웹사이트는 Google Analytics를 사용하여 웹사이트 트래픽을 분석합니다. 
    이 과정에서 개인을 식별할 수 있는 정보는 수집되지 않습니다.
    
    5.개인정보 보호 관련 문의:
     - 이메일: company_color@icloud.com
    
    시행일자 : 2024년 08월 28일
  `;


    return (
      <>
        <Box p={8} maxWidth="1200px" margin="0 auto" >
          <VStack spacing={8} align="stretch">
            <Box
              width="100%"
              maxWidth="800px"
              padding={{ base: 6, md: 30 }}
              margin="0 auto"
              borderRadius="16px"
              background="white"
            >
              <Text
                fontWeight="700"
                fontSize="1.4rem"
                mb="2"
              >
                COMPANY COLOR 란?
              </Text>
              <Text
                wordBreak="keep-all"
                paddingRight={{ base: 0, md: 150 }}
                style={{ whiteSpace: 'pre-wrap', lineHeight: '2' }}
              >
                {infoText}
              </Text>
            </Box>

            <Box
              width="100%"
              maxWidth="800px"
              padding={{ base: 6, md: 30 }}
              margin="0 auto"
              borderRadius="16px"
              background="white"
            >
              <Text
                fontWeight="700"
                fontSize="1.4rem"
                mb="2"
              >
                사이트의 기능
              </Text>
              <Text
                wordBreak="keep-all"
                paddingRight={{ base: 0, md: 150 }}
                style={{ whiteSpace: 'pre-wrap', lineHeight: '2' }}
              >
                {siteFunction}
              </Text>
            </Box>
            <Box
              width="100%"
              maxWidth="800px"
              padding={{ base: 6, md: 30 }}
              margin="0 auto"
              borderRadius="16px"
              background="white"
            >
              <Text
                fontWeight="700"
                fontSize="1.4rem"
                mb="2"
              >
                개인정보 취급방침
              </Text>
              <Text
                style={{ whiteSpace: 'pre-wrap', lineHeight: '2' }}
              >
                {policyText}
              </Text>
            </Box>
          </VStack>
        </Box>
      </>
    )

}

export default SiteInfo;
