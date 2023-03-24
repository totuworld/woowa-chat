import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Avatar,
  Box,
  Button,
  Flex,
  Input,
  Spacer,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { memberFindByScreenNameForClient } from '@/models/member/member.client.service';
import { InMemberInfo } from '@/models/member/in_member_info';
import { useAuth } from '@/contexts/auth_user.context';
import ColorPalette from '@/styles/color_palette';

interface Props {
  completeAdd: () => void;
}

export const OwnerMemberSearch = function ({ completeAdd }: Props) {
  const { token } = useAuth();
  const toast = useToast();
  const [emailText, setEmailText] = useState('');
  const [descText, setDescText] = useState('');
  const [searchedMemberInfo, setSearchMemberInfo] = useState<InMemberInfo | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<any>();
  async function search() {
    const searchText = emailText.trim().replace(/@([A-Z|a-z|0-9])+((\.){0,1}[A-Z|a-z|0-9]){2}\.[a-z]{2,3}$/i, '');
    if (searchText.length === 0) {
      toast({
        title: 'email 입력을 확인해주세요',
        position: 'top-right',
      });
      return;
    }
    try {
      const resp = await memberFindByScreenNameForClient({ screenName: searchText, isServer: false });
      if (resp.status === 200 && resp.payload !== undefined) {
        setSearchMemberInfo(resp.payload);
        return;
      }
      toast({
        title: '없는 email이거나 혹은 서비스 가입을 요청해주세요',
        position: 'top-right',
        duration: 7_000,
      });
    } catch (e) {
      console.error(e);
    }
  }
  async function addMember() {
    if (token === null) return;
    try {
      const addMemberResp = await fetch('/api/owner-member.add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: token,
        },
        body: JSON.stringify({ ...searchedMemberInfo, desc: descText }),
      });
      console.info(addMemberResp.status);
      setEmailText('');
      setDescText('');
      setSearchMemberInfo(null);
      completeAdd();
      onClose();
    } catch (e) {
      console.error(e);
    }
  }
  return (
    <>
      <Box mb="2">
        <Flex>
          <Input
            placeholder="추가할 멤버의 email을 입력해주세요"
            value={emailText}
            onChange={(v) => {
              setEmailText(v.currentTarget.value);
            }}
          />
          <Button
            bgColor={`${ColorPalette.mint}`}
            textColor="white"
            _hover={{ bg: ColorPalette.mint_disabled }}
            ml="2"
            onClick={() => {
              search();
            }}
          >
            검색
          </Button>
        </Flex>
        {searchedMemberInfo !== null && (
          <Box mt="2" mb="2">
            검색된 회원 정보입니다.
            <Flex>
              <Avatar size="md" src={searchedMemberInfo.photoURL} mr="2" />
              <Box>
                <Text fontSize="lg">{searchedMemberInfo.displayName}</Text>
                <Text fontSize="sm">{searchedMemberInfo.email}</Text>
              </Box>
              <Spacer />
              <Button
                onClick={() => {
                  setDescText('');
                  onOpen();
                }}
              >
                등록
              </Button>
            </Flex>
          </Box>
        )}
      </Box>
      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              관리자 목록에 추가
            </AlertDialogHeader>

            <AlertDialogBody>
              <span style={{ fontWeight: 800 }}>
                {searchedMemberInfo?.displayName}({searchedMemberInfo?.email})
              </span>
              님을 목록에서 추가할까요?
              <Input
                placeholder="추가가할 설명이 있다면 입력해주세요"
                value={descText}
                onChange={(v) => {
                  setDescText(v.currentTarget.value);
                }}
              />
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                취소
              </Button>
              <Button
                colorScheme="blue"
                ml={3}
                onClick={() => {
                  addMember();
                }}
              >
                추가
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};
