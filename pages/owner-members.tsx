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
import { InOwnerMember } from '@/features/owner_member/model/in_owner_member';
import { OwnerMemberSearch } from '@/features/owner_member/components/owner_member_search';

const IndexPage: NextPage = function () {
  const { isOwner, token } = useAuth();
  const toast = useToast();
  const [memberListCallAction, updateMemberListCallAction] = useState(false);
  const [ownerList, setOwnerList] = useState<InOwnerMember[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<InOwnerMember | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<any>();
  const queryKey = ['owner-members', isOwner, memberListCallAction];
  useQuery(
    queryKey,
    // eslint-disable-next-line no-return-await
    async () =>
      axios.get<InOwnerMember[]>('/api/owner-member.list', {
        headers: {
          authorization: token ?? '',
        },
      }),
    {
      enabled: isOwner,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        if (data.status === 200 && data.data) {
          setOwnerList(data.data);
        }
      },
    },
  );
  return (
    <ServiceLayout height="100vh" backgroundColor="gray.50">
      <Box maxW="xl" mx="auto">
        <Box spacing="12px" mt="6">
          <Box px="2">
            <OwnerMemberSearch
              completeAdd={() => {
                updateMemberListCallAction((prev) => !prev);
              }}
            />
          </Box>
          {ownerList.map((item) => (
            <Flex key={`flex-${item.uid}`} bg="white" p="2" alignItems="center" borderRadius="md" mb="2">
              <Box>
                <Text fontSize="lg">{item.displayName}</Text>
                <Text fontSize="sm">{item.email}</Text>
                <Text fontSize="sm">{item.desc}</Text>
              </Box>
              <Spacer />
              <Box>
                <Button
                  colorScheme="red"
                  onClick={() => {
                    setDeleteTarget(item);
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
              관리자 목록에서 제거
            </AlertDialogHeader>

            <AlertDialogBody>
              <span style={{ fontWeight: 800 }}>
                {deleteTarget?.displayName}({deleteTarget?.email})
              </span>
              님을 목록에서 제거할까요?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                취소
              </Button>
              <Button
                colorScheme="red"
                onClick={() => {
                  fetch(`/api/owner-member.remove/${deleteTarget?.uid}`, {
                    method: 'delete',
                    headers: { authorization: token! },
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
                      updateMemberListCallAction((prev) => !prev);
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
