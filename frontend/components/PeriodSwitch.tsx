'use client'

import { Box, HStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'

/**
 * iOS 26 Liquid Glass 풍 세그먼트 컨트롤.
 *
 * - 컨테이너: 어두운 글래스 트랙 (반투명 + blur + 옅은 보더)
 * - 선택 인디케이터: 반투명 흰 캡슐 + 보더 + 그림자
 * - framer-motion 의 `layoutId` 로 인디케이터가 spring physics 로 슬라이드
 *
 * 클릭 시 선택된 항목의 색이 바뀌고, 흰 캡슐이 자연스럽게 그 위치로 흘러간다.
 */

interface PeriodOption<T extends string | number> {
  value: T
  label: string
}

interface PeriodSwitchProps<T extends string | number> {
  options: ReadonlyArray<PeriodOption<T>>
  value: T
  onChange: (next: T) => void
  /** layoutId 충돌 방지용 — 한 페이지에 여러 PeriodSwitch 가 있을 때 다르게 지정. */
  layoutId?: string
}

const PeriodSwitch = <T extends string | number>({
  options,
  value,
  onChange,
  layoutId = 'period-switch-pill',
}: PeriodSwitchProps<T>) => {
  return (
    <HStack
      spacing={0}
      p={1}
      bg="blackAlpha.100"
      backdropFilter="blur(10px)"
      borderRadius="full"
      border="1px solid"
      borderColor="whiteAlpha.600"
      boxShadow="inset 0 1px 2px rgba(255,255,255,0.4), 0 1px 2px rgba(0,0,0,0.05)"
      display="inline-flex"
    >
      {options.map((opt) => {
        const isActive = opt.value === value
        return (
          <Box
            key={String(opt.value)}
            as="button"
            type="button"
            position="relative"
            px={5}
            py={2}
            fontSize="sm"
            fontWeight="medium"
            color={isActive ? 'blue.700' : 'gray.600'}
            transition="color 0.25s ease"
            onClick={() => onChange(opt.value)}
            cursor="pointer"
            outline="none"
            _focusVisible={{
              boxShadow: '0 0 0 2px rgba(66,153,225,0.5)',
              borderRadius: 'full',
            }}
          >
            {isActive && (
              <motion.span
                layoutId={layoutId}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(255,255,255,0.85)',
                  borderRadius: 9999,
                  border: '1px solid rgba(255,255,255,0.7)',
                  boxShadow:
                    '0 2px 8px rgba(0,0,0,0.12), inset 0 1px 1px rgba(255,255,255,0.6)',
                  zIndex: 0,
                }}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <Box position="relative" zIndex={1}>
              {opt.label}
            </Box>
          </Box>
        )
      })}
    </HStack>
  )
}

export default PeriodSwitch
