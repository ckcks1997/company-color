'use client'

import {
  Button,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
} from '@chakra-ui/react'
import { InfoOutlineIcon } from '@chakra-ui/icons'
import type { ReactNode } from 'react'

interface InfoPopoverProps {
  content: ReactNode
}

function InfoPopover({ content }: InfoPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="unstyled" height="auto" minWidth="auto" padding={0}>
          <InfoOutlineIcon boxSize={3} ml={1} />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverBody>{content}</PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

export default InfoPopover
