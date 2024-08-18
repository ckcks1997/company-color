import React, { useState } from 'react';
import { Flex, Input, Button, Box } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/search_business?business_name=${searchTerm}`);
      const data = await response.json();
      console.log(data)
      navigate('/result', { state: { searchResult: data } });
    } catch (error) {
      console.error('Error fetching data:', error);

    }
  };

  return (
    <Flex
      direction="column"
      minHeight="calc(100vh - 112px)"
      justifyContent="center"
      alignItems="center"
      p={8}
    >
      <Box width="100%" maxWidth="500px">
        <Input
          placeholder="검색어를 입력하세요"
          size="lg"
          mb={4}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button
          onClick={handleSearch}
          colorScheme="blue"
          width="100%"
        >
          검색
        </Button>
      </Box>
    </Flex>
  );
}

export default Home;