import { Flex, Input, Button, Box } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  const handleSearch = () => {
    navigate('/result');
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