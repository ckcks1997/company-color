import React, {useState} from 'react';
import {Box, Heading, SimpleGrid, Text, VStack, Flex} from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';

function BusinessInfo() {
  const navigate = useNavigate();
  const { businessData } = location.state || {};
  const [isLoading, setIsLoading] = useState(false);


  return (
    <Box p={8}>

    </Box>
  );
}

export default BusinessInfo;