import { NextPage } from 'next';
import getConfig from 'next/config';
import Head from 'next/head';
import { useRouter } from 'next/router';
import 'antd/dist/antd.css';
import { Box, Button } from '@chakra-ui/react';
import { ServiceLayout } from '@/components/containers/service_layout';
import { useAuth } from '@/contexts/auth_user.context';
import MainInfo from '@/features/home/MainInfo';

/** 최초 진입 페이지
 *
 * 가입 유도 문구
 *
 */
const IndexPage: NextPage = function () {
  const router = useRouter();
  const { publicRuntimeConfig } = getConfig();
  const mainUrl = `https://${publicRuntimeConfig.mainDomain}`;
  const { authUser } = useAuth();

  return (
    <>
      <Head>
        <meta property="og:url" content={mainUrl} />
        <meta property="og:image" content={`https://${publicRuntimeConfig.mainDomain}/main.jpg`} />
        <meta property="og:site_name" content="공감톡톡" />
        <meta property="og:title" content="공감톡톡 - 질문과 댓글 도우미" />
        <meta property="og:description" content="공감과 이해가 톡톡! 공감톡톡" />
        <meta name="twitter:title" content="공감톡톡 - 질문과 댓글 도우미" />
        <meta name="twitter:description" content="공감과 이해가 톡톡! 공감톡톡" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`https://${publicRuntimeConfig.mainDomain}/none_message.png`} />
        <meta name="twitter:image:alt" content="공감톡톡" />
        <meta name="twitter:url" content={mainUrl} />
        <meta name="twitter:domain" content={publicRuntimeConfig.mainDomain} />
      </Head>
      <ServiceLayout height="100vh" backgroundColor="gray.200" title="공감톡톡" pt={16}>
        {authUser === null && <MainInfo />}
        {authUser !== null && (
          <Box
            display="flex"
            flexDirection={{ base: 'column', md: 'row' }}
            justifyContent="center"
            mt={6}
            gap={4}
            mx={{ base: 4, md: 0 }}
          >
            <Button
              colorScheme="blue"
              size="lg"
              width={{ base: '100%', md: 'auto' }}
              onClick={() => router.push('/town-hall-meeting')}
            >
              전사타운홀
            </Button>
            <Button
              colorScheme="blue"
              size="lg"
              width={{ base: '100%', md: 'auto' }}
              onClick={() => router.push('/list')}
            >
              공감톡톡
            </Button>
            <Button
              colorScheme="blue"
              size="lg"
              width={{ base: '100%', md: 'auto' }}
              onClick={() => router.push('/leader_meeting')}
            >
              리더십타운홀
            </Button>
            <Button
              colorScheme="blue"
              size="lg"
              width={{ base: '100%', md: 'auto' }}
              onClick={() => router.push('/division-town-hall')}
            >
              부문/센터타운홀
            </Button>
          </Box>
        )}
      </ServiceLayout>
    </>
  );
};

export default IndexPage;
