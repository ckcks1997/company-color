'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import theme from '@/theme'

export function Providers({ children }) {
  // React Query 클라이언트를 컴포넌트 내부에서 생성하여 서버 사이드 렌더링 시 
  // 각 요청마다 새로운 인스턴스가 생성
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false, // 윈도우 포커스 시 재요청 비활성화
        retry: 1, // 실패 시 재시도 횟수
        suspense: false, // 서스펜스 모드 비활성화
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        {children}
      </ChakraProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}