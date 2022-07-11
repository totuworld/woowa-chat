import { Box, Flex, Button, Stack, useColorModeValue, Spacer } from '@chakra-ui/react';
import { useAuth } from '@/contexts/auth_user.context';

const GNB: React.FC = function () {
  const { loading, authUser, signOut } = useAuth();

  const loginBtn = (
    <Button
      fontSize="sm"
      fontWeight={600}
      color="white"
      bg="pink.400"
      _hover={{
        bg: 'pink.300',
      }}
      onClick={() => {
        window.location.href = '/login';
      }}
    >
      로그인
    </Button>
  );
  const logoutBtn = (
    <Button as="a" fontSize="sm" fontWeight={400} variant="link" onClick={signOut}>
      로그아웃
    </Button>
  );
  const authInitialized = loading || authUser === null;

  return (
    <Box
      borderBottom={1}
      borderStyle="solid"
      borderColor={useColorModeValue('gray.200', 'gray.900')}
      bg={useColorModeValue('white', 'gray.800')}
    >
      <Flex
        color={useColorModeValue('gray.600', 'white')}
        minH="60px"
        py={{ base: 2 }}
        px={{ base: 4 }}
        align="center"
        maxW="xl"
        mx="auto"
      >
        <Spacer flex={{ base: 1 }} />
        <Flex flex={{ base: 2 }} justify={{ base: 'center', md: 'start' }}>
          <img style={{ height: '40px' }} src="/talktalk_logo.png" alt="logo" />
        </Flex>

        <Stack flex={{ base: 1, md: 0 }} justify="flex-end" direction="row" spacing={6}>
          {authInitialized ? loginBtn : logoutBtn}
        </Stack>
      </Flex>
    </Box>
  );
};

export default GNB;
