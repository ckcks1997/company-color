import {Button, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger} from "@chakra-ui/react";
import {InfoOutlineIcon} from "@chakra-ui/icons";
import React from "react";

function InfoPopover({ content }) {
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

export default InfoPopover;