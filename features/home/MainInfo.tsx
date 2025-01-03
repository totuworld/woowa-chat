import { Box, Center, Flex, Heading, Text } from '@chakra-ui/react';

const MainInfo = function () {
  return (
    <Box maxW="xl" mx="auto">
      <Center marginBottom="10" p="6">
        <Box>
          <img src="/intro.png" alt="hero" />
          <Flex justify="center" alignItems="center" flexDir="column">
            <Heading>Q&A 도우미</Heading>
            <Text>이 서비스는 우아한형제들 임직원용 서비스입니다.</Text>
          </Flex>
        </Box>
      </Center>
    </Box>
  );
};

export default MainInfo;
