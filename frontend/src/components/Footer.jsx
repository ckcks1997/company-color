import {Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Text} from '@chakra-ui/react';

function Footer() {
  return (
    <Accordion defaultIndex={[0]}>
      <AccordionItem>
        <h2>
          <AccordionButton >
            <Box as='span' flex='1' textAlign='left'>
              서비스 정보
            </Box>
            <AccordionIcon/>
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <Box bg="gray.200" py={4} textAlign="center">
            <Text>©2024 COMPANY COLOR. All rights reserved.</Text>
            <Text>문의: company_color@icloud.com</Text>
          </Box>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}

export default Footer;