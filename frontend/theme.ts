import { extendTheme, type SystemStyleObject } from '@chakra-ui/react'

const theme = extendTheme({
  fonts: {
    heading: 'Pretendard, sans-serif',
    body: 'Pretendard, sans-serif',
  },
  styles: {
    global: {
      // body 는 투명에 가깝게 — 전역 Aurora 캔버스가 보이도록.
      // body 자체는 stacking context 의 가장 아래라 캔버스가 그 위로 그려짐.
      body: {
        bg: 'transparent',
        color: 'gray.800',
      },
    },
  },
})

export default theme

/**
 * 글래스모피즘 카드 공용 스타일.
 * 어두운 Aurora 배경 위에서 살짝 떠 있는 반투명 흰 카드.
 * 각 카드의 기존 텍스트(어두운 회색)와 그대로 어울린다.
 */
export const glassCard: SystemStyleObject = {
  bg: 'whiteAlpha.800',
  backdropFilter: 'blur(14px)',
  border: '1px solid',
  borderColor: 'whiteAlpha.500',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
  borderRadius: 'lg',
}

/**
 * 약간 더 진한 글래스 — 강조가 필요한 컨테이너 (헤더성 박스 등).
 */
export const glassPanel: SystemStyleObject = {
  bg: 'whiteAlpha.900',
  backdropFilter: 'blur(16px)',
  border: '1px solid',
  borderColor: 'whiteAlpha.600',
  boxShadow: '0 8px 28px rgba(0, 0, 0, 0.18)',
  borderRadius: 'xl',
}
