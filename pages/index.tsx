import { NextPage } from 'next';
import getConfig from 'next/config';
import Head from 'next/head';
import { Avatar, Box, Button, Menu, MenuButton, IconButton, MenuList, MenuItem, Text, Flex } from '@chakra-ui/react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth_user.context';
import ColorPalette from '@/styles/color_palette';

const BUTTONS = [
  {
    title: '전사 타운홀',
    description: '회사 장기적 목표와 사업방향성, 일하는 방식을 함께 공유해요',
    path: '/town-hall-meeting',
  },
  {
    title: '공감톡톡',
    description: '우아한형제들의 이모저모를 서로 진솔하게 대화하며 공감과 이해를 톡톡 쌓아가요',
    path: '/list',
  },
  {
    title: '리더십 타운홀',
    description: '지표를 통해 현황을 파악하고 문제/개선점/실행계획을 구체화해요',
    path: '/leader_meeting',
  },
  {
    title: '부문/센터 타운홀',
    description: '전사 방향성을 바탕으로 부문별 과제와 목표를 공유해요',
    path: '/division-town-hall',
  },
];

const ButtonComponent = function ({ title, description, path }: { title: string; description: string; path: string }) {
  return (
    <Flex flexDirection="column" alignItems="center" maxWidth={{ base: '100%', md: '50%' }} flex="1">
      <Button
        bgColor="black"
        color="white"
        fontWeight="bold"
        fontSize="16pt"
        padding="6"
        onClick={() => {
          window.location.href = path;
        }}
      >
        {title} <img src="btn_arrow_1.png" alt="arrow" style={{ height: '20px', marginLeft: '8px' }} />
      </Button>
      <Text fontSize="12pt" color="#bdbdbd" mt="2" textAlign="center" width="100%">
        {description}
      </Text>
    </Flex>
  );
};
/** 최초 진입 페이지
 *
 * 가입 유도 문구
 *
 */
const IndexPage: NextPage = function () {
  const { publicRuntimeConfig } = getConfig();
  const mainUrl = `https://${publicRuntimeConfig.mainDomain}`;
  const { loading, authUser, signOut, isOwner, signInWithGoogle } = useAuth();

  const loginBtn = (
    <Button
      fontSize="sm"
      fontWeight={600}
      bgColor={`${ColorPalette.mint}`}
      textColor="white"
      _hover={{ bg: ColorPalette.mint_disabled }}
      onClick={() => {
        signInWithGoogle(window.location.pathname);
      }}
    >
      로그인
    </Button>
  );
  const logoutBtn = (
    <Menu>
      <MenuButton
        as={IconButton}
        width="50px"
        icon={<Avatar size="md" src="/none_message.png" />}
        borderRadius="full"
      />
      <MenuList>
        {isOwner && (
          <MenuItem
            onClick={() => {
              window.location.href = '/list';
            }}
          >
            공감톡톡 목록
          </MenuItem>
        )}
        {isOwner && (
          <MenuItem
            onClick={() => {
              window.location.href = '/owner-members';
            }}
          >
            관리자 추가/삭제
          </MenuItem>
        )}
        <MenuItem onClick={signOut}>로그아웃</MenuItem>
      </MenuList>
    </Menu>
  );
  const authInitialized = loading || authUser === null;

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
      <Box display="flex" flexDirection="column" width="full" maxWidth="1300px" mx="auto" mt={{ base: '0', md: '10' }}>
        {/* 상단 로고 라인 */}
        <Box display="flex" justifyContent="space-between" p="2">
          <Link href="/">
            <img style={{ height: '40px', cursor: 'pointer' }} src="/main_LOGO.png" alt="logo" />
          </Link>
          <Box>{authInitialized ? loginBtn : logoutBtn}</Box>
        </Box>
        <Box fontFamily="BMHANNA_11yrs" fontSize="80pt" mx="auto" mt="10">
          더 자주! 더 깊이! 소통해요~
        </Box>
        {/* 2px line */}
        <Box height="2px" bgColor="black" mt={{ base: '20', '2xl': '40' }} />
        <Box
          mt={{ base: '10', md: '10', xl: '20', '2xl': '60' }}
          display="flex"
          justifyContent="space-between"
          px="10"
          flexDirection={{ base: 'column', md: 'row' }}
          gap={{ base: '4', md: '20' }}
          mb={{ base: '20', md: '20' }}
        >
          {BUTTONS.map((button) => (
            <ButtonComponent
              key={button.title}
              title={button.title}
              description={button.description}
              path={button.path}
            />
          ))}
        </Box>
      </Box>
      {/* footer */}
      <Box
        display="flex"
        justifyContent="space-between"
        p="2"
        bgColor="#eeeeee"
        alignItems="center"
        position="fixed"
        bottom="0"
        left="0"
        right="0"
        zIndex="10"
        width="full"
        px="40"
        mx="auto"
      >
        <Text color="#999999" fontSize="10pt">
          전사 우아한소통 관련한 문의는 언제든지 편히 피플실 컬쳐커뮤니케이션팀으로 주세요~
        </Text>
        <img src="/woowa_logo.png" alt="우아한형제들" style={{ height: '22px' }} />
      </Box>
    </>
  );
};

export default IndexPage;
