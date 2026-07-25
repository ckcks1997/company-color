'use client'

import { IconButton, useToast } from '@chakra-ui/react'
import { Star } from 'lucide-react'
import { useFavoriteToggle } from '@/lib/hooks/useFavorites'

interface FavoriteToggleProps {
  hash: string
  companyNm?: string | null
  size?: 'sm' | 'md' | 'lg'
}

const FavoriteToggle = ({ hash, companyNm, size = 'sm' }: FavoriteToggleProps) => {
  const { isLoggedIn, isFavorite, isPending, toggle } = useFavoriteToggle(hash, companyNm)
  const toast = useToast()

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isLoggedIn) {
      toast({
        title: '로그인이 필요합니다',
        description: '즐겨찾기는 로그인 후 이용하실 수 있어요.',
        status: 'info',
        duration: 2500,
        isClosable: true,
      })
      return
    }
    await toggle()
  }

  return (
    <IconButton
      aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
      icon={
        <Star
          size={18}
          fill={isFavorite ? '#F6E05E' : 'none'}
          color={isFavorite ? '#D69E2E' : '#A0AEC0'}
        />
      }
      size={size}
      variant="ghost"
      isLoading={isPending}
      onClick={handleClick}
    />
  )
}

export default FavoriteToggle
