import { GetServerSideProps, NextPage } from 'next';
import {
  Avatar,
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Spacer,
  Text,
  Textarea,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import Link from 'next/link';
import ResizeTextarea from 'react-textarea-autosize';
import { useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import 'antd/dist/antd.css';
import { useRouter } from 'next/router';
import { ServiceLayout } from '@/components/containers/service_layout';
import { InInstantEvent } from '@/models/instant_message/interface/in_instant_event';
import { InInstantEventMessage } from '@/models/instant_message/interface/in_instant_event_message';
import { getBaseUrl } from '@/utils/get_base_url';
import getStringValueFromQuery from '@/utils/get_value_from_query';
import InstantInfo from '@/features/instant_message/header/instant_info.component';
import FirebaseAuthClient from '@/models/auth/firebase_auth_client';
import { useAuth } from '@/contexts/auth_user.context';
import InstantEventHeaderSideMenu from '@/features/instant_message/header/side_menu.component';
import ChatClientService from '@/features/instant_message/chat.client.service';
import ColorPalette from '@/styles/color_palette';
import InstantEventUtil from '@/features/instant_message/instant_event.util';
import CreateEvent from '@/features/instant_message/create_event.component';
import MessageList from '@/features/instant_message/message_list';
import GoogleLoginButton from '@/components/google_login_button';

async function updateEvent({
  instantEventId,
  title,
  desc,
  startDate,
  endDate,
  titleImg,
  bgImg,
}: {
  instantEventId: string;
  title: string;
  desc?: string;
  startDate?: string;
  endDate?: string;
  titleImg?: string;
  bgImg?: string;
}) {
  if (title.length <= 0) {
    return {
      result: false,
      message: '제목을 입력해주세요',
    };
  }
  try {
    const resp = await ChatClientService.updateInfo({
      instantEventId,
      title,
      desc,
      startDate,
      endDate,
      titleImg,
      bgImg,
    });
    return {
      result: true,
      instantEventId: resp.payload?.instantEventId,
    };
  } catch (err) {
    console.error(err);
    return {
      result: false,
      message: '수정 실패',
    };
  }
}

interface Props {
  host: string;
  instantEventInfo: InInstantEvent | null;
}

async function postMessage({ message, instantEventId }: { message: string; instantEventId: string }) {
  if (message.length <= 0) {
    return {
      result: false,
      message: '메시지를 입력해주세요',
    };
  }
  try {
    await ChatClientService.post({
      instantEventId,
      message,
    });
    return {
      result: true,
    };
  } catch (err) {
    console.error(err);
    return {
      result: false,
      message: '등록 실패',
    };
  }
}

const EventHomePage: NextPage<Props> = function ({ instantEventInfo: propsEventInfo }) {
  const toast = useToast();
  const { query } = useRouter();
  const { authUser, isOwner, token, signInWithGoogle } = useAuth();
  const [message, updateMessage] = useState('');
  const [instantEventInfo, setInstantEventInfo] = useState(propsEventInfo);
  const [listLoadTrigger, setListLoadTrigger] = useState(false);
  const [messageList, setMessageList] = useState<InInstantEventMessage[]>([]);
  const sortedMessageList = useMemo(() => [...messageList].sort((a, b) => b.sortWeight - a.sortWeight), [messageList]);
  const [isSending, setSending] = useState(false);

  const isPreview = (() => {
    if (query.isPreview === undefined) return false;
    if (typeof query.isPreview === 'string') return query.isPreview === 'true';
    return query.isPreview[0] === 'true';
  })();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const eventState = InstantEventUtil.calEventState(instantEventInfo);
  console.info({ eventState });

  const messageListQueryKey = ['chatMessageList', instantEventInfo?.instantEventId, authUser, listLoadTrigger];
  const { status } = useQuery(
    messageListQueryKey,
    async () => {
      const extractToken = await FirebaseAuthClient.getInstance().Auth.currentUser?.getIdToken();
      const resp = await axios.get<InInstantEventMessage[]>(
        `/api/instant-event.messages.list/${instantEventInfo?.instantEventId}?isPreview=${isPreview}`,
        {
          headers: extractToken
            ? {
                authorization: extractToken,
              }
            : {},
        },
      );
      return resp;
    },
    {
      enabled:
        (eventState === 'reply' || eventState === 'locked' || eventState === 'showAll' || isOwner) && token !== null,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        if (data.status === 200 && data.data) {
          setMessageList(data.data);
        }
      },
    },
  );

  if (instantEventInfo === null) {
    return <p>정보를 찾을 수 없습니다.</p>;
  }

  async function modify(data: {
    instantEventId: string;
    title: string;
    desc?: string;
    startDate?: string;
    endDate?: string;
    titleImg?: string;
    bgImg?: string;
  }) {
    const resp = await updateEvent(data);
    if (resp.result === false) {
      toast({
        title: '이벤트 정보 수정 실패',
        position: 'top-right',
      });
    }
    if (resp.result === true) {
      toast({
        title: '이벤트 정보 수정 성공',
        position: 'top-right',
      });
    }
  }

  return (
    <ServiceLayout
      minH="100vh"
      backgroundColor="gray.200"
      bgImage={instantEventInfo.bgImg ?? undefined}
      bgSize="100% auto"
      bgRepeat="no-repeat"
      title="우수타 공감톡톡"
    >
      <Box
        maxW="xl"
        mx="auto"
        pt="6"
        bgColor="gray.200"
        minH="95vh"
        overflow="scroll; height:200px;"
        __css={{
          '::-webkit-scrollbar': {
            display: 'none',
          },
        }}
      >
        {isOwner && isPreview === false && (
          <Box mb="2">
            <Link href="/list">
              <a>
                <Button fontSize="sm" leftIcon={<ChevronLeftIcon />}>
                  리스트로 이동
                </Button>
              </a>
            </Link>
            <Button
              fontSize="sm"
              onClick={() => {
                onOpen();
              }}
            >
              정보 수정
            </Button>
          </Box>
        )}
        <CreateEvent
          isShow={isOpen}
          mode="MODIFY"
          origin={{ ...instantEventInfo }}
          onClose={onClose}
          onClickSave={(saveData) => {
            modify({ ...saveData, instantEventId: instantEventInfo.instantEventId })
              .then(() =>
                ChatClientService.get({
                  instantEventId: instantEventInfo.instantEventId,
                }),
              )
              .then((resp) => {
                if (resp.status === 200 && resp.payload) {
                  setInstantEventInfo(resp.payload);
                }
              })
              .catch((err) => {
                console.error(err);
              })
              .finally(() => {
                onClose();
              });
          }}
        />
        <Box rounded="md" overflow="hidden" bg="white">
          {isOwner && (
            <Box width="full" float="left" height="0">
              <Flex pr="2" pt="2">
                <Spacer />
                <InstantEventHeaderSideMenu
                  instantEventInfo={instantEventInfo}
                  eventState={eventState}
                  onCompleteLockOrClose={() => {
                    ChatClientService.get({
                      instantEventId: instantEventInfo.instantEventId,
                    }).then((resp) => {
                      if (resp.status === 200 && resp.payload) {
                        setInstantEventInfo(resp.payload);
                      }
                    });
                  }}
                />
              </Flex>
            </Box>
          )}
          <InstantInfo instantEventInfo={instantEventInfo} eventState={eventState} isPreview={isPreview} />
        </Box>
        {eventState === 'question' && authUser !== null && (
          <Box borderWidth="1px" borderRadius="lg" p="2" overflow="hidden" bg="white" mt="6">
            <Flex>
              <Box pt="1" pr="2">
                <Avatar size="xs" src="/profile_anonymous.png" />
              </Box>
              <Textarea
                bg="gray.100"
                border="none"
                boxShadow="none !important"
                placeholder="익명으로 질문할 내용을 입력해주세요"
                borderRadius="md"
                resize="none"
                minH="unset"
                minRows={1}
                maxRows={7}
                overflow="hidden"
                fontSize="xs"
                mr="2"
                as={ResizeTextarea}
                value={message}
                onChange={(e) => {
                  // 최대 10줄만 스크린샷에 표현되니 10줄 넘게 입력하면 제한걸어야한다.
                  if (e.target.value) {
                    const lineCount = (e.target.value.match(/[^\n]*\n[^\n]*/gi)?.length ?? 1) + 1;
                    if (lineCount > 10) {
                      toast({
                        title: '최대 10줄까지만 입력가능합니다',
                        position: 'top-right',
                      });
                      return;
                    }
                  }
                  updateMessage(e.target.value);
                }}
              />
              <Button
                isLoading={isSending}
                disabled={isSending}
                bgColor={`${ColorPalette.mint}`}
                textColor="white"
                _hover={{ bg: ColorPalette.mint_disabled }}
                variant="solid"
                size="sm"
                onClick={async () => {
                  if (message.trim().length <= 0) {
                    toast({
                      title: '공백을 제외하고 최소 1자 이상의 글자를 입력해주세요',
                      position: 'top-right',
                      status: 'warning',
                    });
                    return;
                  }
                  if (message.trim().length > 1000) {
                    toast({
                      title: '1000자 내로 입력해주세요',
                      position: 'top-right',
                      status: 'warning',
                    });
                    return;
                  }
                  setSending(true);
                  const resp = await postMessage({
                    message: message.trim(),
                    instantEventId: instantEventInfo.instantEventId,
                  });
                  if (resp.result === false) {
                    toast({
                      title: '메시지 등록 실패',
                      position: 'top-right',
                    });
                  }
                  if (resp.result === true) {
                    toast({
                      title: '질문 등록이 완료 되었습니다',
                      position: 'top-right',
                    });
                  }
                  if (isOwner) {
                    setListLoadTrigger((prev) => !prev);
                  }
                  updateMessage('');
                  setSending(false);
                }}
              >
                등록
              </Button>
            </Flex>
          </Box>
        )}
        {authUser === null && (
          <Box maxW="xl" mx="auto" minH="80vh">
            <Center marginBottom="10" p="6">
              <Box>
                <img src="/intro.png" alt="hero" />
                <Flex justify="center" alignItems="center" flexDir="column">
                  <Heading>우수타 공감톡톡</Heading>
                  <Text>이 서비스는 우아한형제들 임직원용 서비스입니다.</Text>
                </Flex>
              </Box>
            </Center>
            <GoogleLoginButton
              isStart={false}
              onClickLogin={() => {
                signInWithGoogle(`/list/${instantEventInfo.instantEventId}`);
              }}
            />
          </Box>
        )}
        {authUser !== null && (
          <MessageList
            messageLoadingStatus={status}
            messageList={sortedMessageList}
            eventInfo={instantEventInfo}
            onSendComplete={(info) => {
              setMessageList((prev) => {
                const findPrevIndex = prev.findIndex((fv) => fv.id === info.id);
                if (findPrevIndex < 0) {
                  return prev;
                }
                const updateArr = [...prev];
                updateArr[findPrevIndex] = info!;
                return updateArr;
              });
            }}
          />
        )}
      </Box>
    </ServiceLayout>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {
  const host = getBaseUrl(true);
  const instantEventId = getStringValueFromQuery({ query, field: 'instantEventId' });
  if (instantEventId === undefined) {
    return {
      props: {
        host,
        instantEventInfo: null,
      },
    };
  }
  try {
    const instantInfo = await ChatClientService.get({
      instantEventId,
      isServer: true,
    });
    return {
      props: {
        host,
        instantEventInfo: instantInfo.payload ?? null,
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        host,
        instantEventInfo: null,
      },
    };
  }
};

export default EventHomePage;
