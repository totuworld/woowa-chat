import { Box, Center, Flex, Heading, Text } from '@chakra-ui/react';
import GoogleLoginButton from '@/components/google_login_button';
import { useAuth } from '@/contexts/auth_user.context';

const MainInfo = function () {
  const { signInWithGoogle } = useAuth();
  return (
    <Box maxW="xl" mx="auto">
      <Box marginTop="20">
        <GoogleLoginButton
          isStart
          onClickLogin={() => {
            signInWithGoogle(window.location.pathname);
          }}
        />
      </Box>
      <Center marginBottom="10" p="6">
        <Box>
          <img src="/intro.png" alt="hero" />
          <Flex justify="center" alignItems="center" flexDir="column">
            <Heading>우수타 공감톡톡</Heading>
            <Text fontSize="sm">우아한형제들만의 수다 문화, 우아한 수다 타임</Text>
          </Flex>
        </Box>
      </Center>
    </Box>
  );
};

export default MainInfo;
