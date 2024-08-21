import React, { useState } from 'react';
import { Flex, Input, Button, Box, Spinner } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/search_business?business_name=${searchTerm}`);
      const data = await response.json();
      navigate('/result', { state: { searchResult: data } });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Flex
      backgroundImage="url('/images/main.jpg')"
      backgroundSize="cover"
      backgroundPosition="left"
      direction="column"
      minHeight="calc(100vh - 112px)"
      justifyContent="center"
      alignItems="center"
      p={8}
    >
      <Box width="100%" maxWidth="500px">
        <Input
          background={'rgba(255,255,255,0.95)'}
          borderRadius="full"
          placeholder="검색어를 입력하세요"
          size="lg"
          mb={4}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button
          onClick={handleSearch}
          colorScheme="blue"
          width="100%"
          disabled={isLoading}
        >
          {isLoading ? <Spinner size="sm" /> : '검색'}
        </Button>
      </Box>
    </Flex>
  );
}

export default Home;