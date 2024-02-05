import {
  Box,
  Flex,
  Button,
  Stack,
  useColorModeValue,
  Spacer,
  Menu,
  MenuButton,
  Avatar,
  MenuList,
  MenuItem,
  IconButton,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth_user.context';
import ColorPalette from '@/styles/color_palette';

const GNB: React.FC = function () {
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
      <MenuButton as={IconButton} icon={<Avatar size="md" src="/profile_anonymous.png" />} borderRadius="full" />
      <MenuList>
        {isOwner && (
          <MenuItem
            onClick={() => {
              window.location.href = '/list';
            }}
          >
            우수타 목록
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
    <Box
      borderBottom={1}
      borderStyle="solid"
      borderColor={useColorModeValue('gray.200', 'gray.900')}
      bg={useColorModeValue('white', 'gray.800')}
      position="fixed"
      top={0}
      width="full"
      zIndex={10}
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
          <Link href="/">
            <img style={{ height: '40px', cursor: 'pointer' }} src="/logo.png" alt="logo" />
          </Link>
        </Flex>

        <Stack flex={{ base: 1, md: 0 }} justify="flex-end" direction="row" spacing={6}>
          {authInitialized ? loginBtn : logoutBtn}
        </Stack>
      </Flex>
    </Box>
  );
};

export default GNB;
