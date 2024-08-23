import React from 'react';
import {
  Box,
  Heading,
  Text,
  Stack,
  Card,
  CardBody,
  StackDivider,
  CardHeader
} from '@chakra-ui/react';
import { useLocation } from 'react-router-dom';
import EmployeeChart from "../components/EmployeeChart.jsx";

function BusinessInfo() {
  const location = useLocation();
  const { businessData } = location.state || {};

  return (
    <Card maxW='md'>
      <CardHeader>
        <Heading size='md'>정보</Heading>
      </CardHeader>

      <CardBody>
        <Stack divider={<StackDivider />} spacing='4'>
          <Box>
            <Heading size='xs' textTransform='uppercase'>
              Lorem ipsum dolor.
            </Heading>
            <Text pt='2' fontSize='sm'>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Distinctio, velit.
            </Text>
          </Box>
          <Box>
            <Heading size='xs' textTransform='uppercase'>
              Lorem ipsum dolor.
            </Heading>
            <Text pt='2' fontSize='sm'>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Enim, nihil.
            </Text>
          </Box>
          {businessData && <EmployeeChart data={businessData} />}
        </Stack>
      </CardBody>
    </Card>
  );
}

export default BusinessInfo;