import { NextPage } from 'next';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Flex,
  Input,
  Spacer,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import axios from 'axios';
import { useQuery } from 'react-query';
import { useRef, useState } from 'react';
import { ServiceLayout } from '@/components/containers/service_layout';
import { useAuth } from '@/contexts/auth_user.context';
import ColorPalette from '@/styles/color_palette';

const IndexPage: NextPage = function () {
  const { isOwner, token } = useAuth();
  const toast = useToast();

  const [emailText, setEmailText] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<any>();

  const queryKey = ['leader-member', isOwner];
  const { data, refetch } = useQuery(
    queryKey,
    // eslint-disable-next-line no-return-await
    async () =>
      axios.get<{ members: string[] }>('/api/leader-member.list', {
        headers: {
          authorization: token ?? '',
        },
      }),
    {
      enabled: isOwner,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    },
  );

  async function add() {
    const email = emailText.trim();
    if (email.length === 0) {
      toast({
        title: 'email 입력을 확인해주세요',
        position: 'top-right',
      });
      return;
    }
    try {
      fetch('/api/leader-member.add', {
        method: 'put',
        headers: { authorization: token!, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
        .then((resp) => {
          if (resp.status === 200) {
            toast({ title: '추가 완료', position: 'top-right' });
          }
        })
        .finally(() => {
          refetch();
          setEmailText('');
        });
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <ServiceLayout height="100vh" backgroundColor="gray.50" pt={16}>
      <Box maxW="xl" mx="auto">
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
              add();
            }}
          >
            추가
          </Button>
        </Flex>
        <Box spacing="12px" mt="6">
          {data !== undefined &&
            data.data.members.map((email) => (
              <Flex key={`flex-${email}`} bg="white" p="2" alignItems="center" borderRadius="md" mb="2">
                <Box>
                  <Text fontSize="lg">{email}</Text>
                </Box>
                <Spacer />
                <Box flexShrink={0}>
                  <Button
                    colorScheme="red"
                    onClick={() => {
                      setDeleteTarget(email);
                      onOpen();
                    }}
                  >
                    제거
                  </Button>
                </Box>
              </Flex>
            ))}
        </Box>
      </Box>
      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              리더 email 목록에서 제거
            </AlertDialogHeader>

            <AlertDialogBody>
              <span style={{ fontWeight: 800 }}>{deleteTarget}</span>을 목록에서 제거할까요?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                취소
              </Button>
              <Button
                colorScheme="red"
                onClick={() => {
                  fetch('/api/leader-member.remove', {
                    method: 'put',
                    headers: { authorization: token!, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: deleteTarget }),
                  })
                    .then((resp) => {
                      if (resp.status === 200) {
                        toast({ title: '제거 완료', position: 'top-right' });
                      }
                    })
                    .catch((err) => {
                      console.error(err);
                    })
                    .finally(() => {
                      refetch();
                      setDeleteTarget(null);
                      onClose();
                    });
                }}
                ml={3}
              >
                제거
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </ServiceLayout>
  );
};

export default IndexPage;
