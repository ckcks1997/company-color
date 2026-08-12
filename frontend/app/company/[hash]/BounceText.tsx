'use client'

import { useEffect, useState } from 'react'
import { Text } from '@chakra-ui/react'

interface Position {
  x: number
  y: number
}

const BounceText = () => {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 })
  const [movePx, setMovePx] = useState<Position>({ x: 5, y: 5 })
  const [color, setColor] = useState<string>('red')

  useEffect(() => {
    const colors = ['red', 'blue', 'green', '#dddd88', 'purple']
    const containerWidth = window.innerWidth
    const containerHeight = window.innerHeight
    const textWidth = 75
    const textHeight = 40

    const intervalId = setInterval(() => {
      setPosition((prevPos) => {
        const newX = prevPos.x + movePx.x
        const newY = prevPos.y + movePx.y
        let newMovePxX = movePx.x
        let newMovePxY = movePx.y

        if (newX <= 0 || newX + textWidth >= containerWidth) {
          newMovePxX = -movePx.x
          setColor(colors[Math.floor(Math.random() * colors.length)])
        }
        if (newY <= 0 || newY + textHeight >= containerHeight) {
          newMovePxY = -movePx.y
          setColor(colors[Math.floor(Math.random() * colors.length)])
        }

        setMovePx({ x: newMovePxX, y: newMovePxY })

        return { x: newX, y: newY }
      })
    }, 80)

    return () => clearInterval(intervalId)
  }, [movePx])

  return (
    <Text
      position="fixed"
      left={`${position.x}px`}
      top={`${position.y}px`}
      fontSize="4xl"
      fontWeight="bold"
      color={color}
      zIndex={9999}
      pointerEvents="none"
    >
      RUN
    </Text>
  )
}

export default BounceText
