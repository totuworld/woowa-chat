import { Box, Center, Flex, Heading, Text } from '@chakra-ui/react';

const TownhallMainInfo = function () {
  return (
    <Box maxW="xl" mx="auto">
      <Center marginBottom="10" p="6">
        <Box>
          <img src="/none_message.png" alt="hero" />
          <Flex justify="center" alignItems="center" flexDir="column">
            <Heading>전사타운홀</Heading>
            <Text fontSize="sm">Q&A용 서비스입니다</Text>
          </Flex>
        </Box>
      </Center>
    </Box>
  );
};

export default TownhallMainInfo;
