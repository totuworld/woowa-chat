import { NextPage } from 'next';
import { Box, Center, Heading, Flex, Text } from '@chakra-ui/react';
import { ServiceLayout } from '@/components/containers/service_layout';
import { useAuth } from '@/contexts/auth_user.context';
import GoogleLoginButton from '@/components/google_login_button';

const IndexPage: NextPage = function () {
  const { signInWithGoogle } = useAuth();
  return (
    <ServiceLayout height="100vh" backgroundColor="gray.50">
      <Box maxW="xl" mx="auto">
        <Center marginTop="20" marginBottom="10" p="6">
          <Box>
            <img src="/intro.png" alt="hero" />
            <Flex justify="center" alignItems="center" flexDir="column">
              <Heading>우수타 공감톡톡</Heading>
              <Text fontSize="sm">우아한형제들만의 수다 문화, 우아한 수다 타임</Text>
            </Flex>
          </Box>
        </Center>
      </Box>
      <GoogleLoginButton isStart={false} onClickLogin={signInWithGoogle} />
    </ServiceLayout>
  );
};

export default IndexPage;
