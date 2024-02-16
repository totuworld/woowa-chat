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
import Presentation from '@/features/instant_message/presentation';

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
  const [uniqueVoterCount, setUniqueVoterCount] = useState(0);
  const eventState = InstantEventUtil.calEventState(instantEventInfo);
  const sortedMessageList = useMemo(
    () =>
      [...messageList].sort((a, b) => {
        // 정렬 기준
        // eventState === 'showAll' 일때는 reaction의 길이가 많은게 먼저다.
        // 그 뒤로 sortWeight를 비교한다.
        // 그러나 다른때는 sortWeight만 가지고 비교한다.
        if (eventState === 'showAll') {
          if (a.reaction === undefined && b.reaction === undefined) return 0;
          if (a.reaction === undefined) return 1;
          if (b.reaction === undefined) return -1;
          if (a.reaction.length > b.reaction.length) return -1;
          if (a.reaction.length < b.reaction.length) return 1;
        }
        return b.sortWeight - a.sortWeight;
      }),
    [messageList, eventState],
  );
  const [isSending, setSending] = useState(false);
  const [showPresentation, setShowPresentation] = useState(false);

  const isPreview = (() => {
    if (query.isPreview === undefined) return false;
    if (typeof query.isPreview === 'string') return query.isPreview === 'true';
    return query.isPreview[0] === 'true';
  })();

  const { isOpen, onOpen, onClose } = useDisclosure();

  console.info({ eventState });

  const messageListQueryKey = ['chatMessageList', instantEventInfo?.instantEventId, authUser, listLoadTrigger];
  const { status } = useQuery(
    messageListQueryKey,
    async () => {
      const extractToken = await FirebaseAuthClient.getInstance().Auth.currentUser?.getIdToken();
      const resp = await axios.get<{ list: InInstantEventMessage[]; uniqueVoterCount: number }>(
        `/api/instant-event.messages.list_with_voter_count/${instantEventInfo?.instantEventId}?isPreview=${isPreview}`,
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
          setMessageList(data.data.list);
          setUniqueVoterCount(data.data.uniqueVoterCount);
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
      title="우수타"
      pt={16}
    >
      <Box maxW="xl" mx="auto" pt="6" bgColor="gray.200">
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
          <InstantInfo
            instantEventInfo={instantEventInfo}
            eventState={eventState}
            isPreview={isPreview}
            uniqueVoterCount={eventState === 'showAll' || eventState === 'locked' ? uniqueVoterCount : undefined}
          />
        </Box>
        {authUser !== null && sortedMessageList.length > 0 && eventState === 'locked' && (
          <Box>
            <Button
              onClick={() => {
                setShowPresentation((prev) => !prev);
              }}
            >
              프리젠테이션 모드
            </Button>
          </Box>
        )}
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
                maxRows={14}
                overflow="hidden"
                fontSize="xs"
                mr="2"
                as={ResizeTextarea}
                value={message}
                onChange={(e) => {
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
                  if (message.trim().length > 5000) {
                    toast({
                      title: '5000자 내로 입력해주세요',
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
                  <Heading>우수타</Heading>
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
        {authUser !== null && showPresentation === false && (
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
        <Presentation
          messageList={sortedMessageList}
          show={showPresentation}
          turnOff={() => {
            setShowPresentation(false);
          }}
          turnOn={() => {
            setShowPresentation(true);
          }}
          instantEventId={instantEventInfo.instantEventId}
        />
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
