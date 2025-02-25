'use client'
import React, { useState, useEffect } from 'react';
import { Text } from '@chakra-ui/react';

const BounceText = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [movePx, setMovePx] = useState({ x: 5, y: 5 });
  const [color, setColor] = useState('red');

  useEffect(() => {
    const colors = ['red', 'blue', 'green', '#dddd88', 'purple'];
    const containerWidth = window.innerWidth; // 브라우져 width, height 크기
    const containerHeight = window.innerHeight;
    const textWidth = 75; //텍스트상자 width, height 지정
    const textHeight = 40;

    const intervalId = setInterval(() => {
      setPosition(prevPos => {
        let newX = prevPos.x + movePx.x; //이동할 x,y 좌표
        let newY = prevPos.y + movePx.y;
        let newMovePxX = movePx.x; // 이동할 px 단위, 끝에 닿으면 +- 바뀜
        let newMovePxY = movePx.y;

        if (newX <= 0 || newX + textWidth >= containerWidth) {
          newMovePxX = -movePx.x;
          setColor(colors[Math.floor(Math.random() * colors.length)]);
        }
        if (newY <= 0 || newY + textHeight >= containerHeight) {
          newMovePxY = -movePx.y;
          setColor(colors[Math.floor(Math.random() * colors.length)]);
        }

        setMovePx({ x: newMovePxX, y: newMovePxY });

        return { x: newX, y: newY };
      });
    }, 80);

    // 클린업 함수(종료/재실행시 동작)
    return () => clearInterval(intervalId);
  }, [movePx]);

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
  );
};

export default BounceText;