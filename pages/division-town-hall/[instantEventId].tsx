import { GetServerSideProps, NextPage } from 'next';
import { Box, Button, Center, Flex, Heading, Spacer, Text, useDisclosure, useToast } from '@chakra-ui/react';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import 'antd/dist/antd.css';
import { useRouter } from 'next/router';
import TiptapEditor from '@/components/TiptapEditor';
import { InInstantEvent } from '@/models/instant_message/interface/in_instant_event';
import { InInstantEventMessage } from '@/models/instant_message/interface/in_instant_event_message';
import { getBaseUrl } from '@/utils/get_base_url';
import getStringValueFromQuery from '@/utils/get_value_from_query';
import FirebaseAuthClient from '@/models/auth/firebase_auth_client';
import { useAuth } from '@/contexts/auth_user.context';
import ColorPalette from '@/styles/color_palette';
import GoogleLoginButton from '@/components/google_login_button';

import TownhallUtil from '@/features/division-town-hall/divmeeting.util';
import TownhallClientService from '@/features/division-town-hall/divmeeting.client.service';
import TownhallHeaderSideMenu from '@/features/division-town-hall/header/side_menu.component';
import TownhallInfo from '@/features/division-town-hall/header/info.component';
import CreateTownhallEvent from '@/features/division-town-hall/create_town_hall.component';
import DivMeetingMessageList from '@/features/division-town-hall/message_list';
import { DivMeetingServiceLayout } from '@/features/division-town-hall/service_layout';
import Presentation from '@/features/instant_message/presentation';

async function updateEvent({
  instantEventId,
  title,
  desc,
  startDate,
  endDate,
  titleImg,
  bgImg,
  isQnA,
  isSecret,
}: {
  instantEventId: string;
  title: string;
  desc?: string;
  startDate?: string;
  endDate?: string;
  titleImg?: string;
  bgImg?: string;
  isQnA?: boolean;
  isSecret?: boolean;
}) {
  if (title.length <= 0) {
    return {
      result: false,
      message: '제목을 입력해주세요',
    };
  }
  try {
    const resp = await TownhallClientService.updateInfo({
      instantEventId,
      title,
      desc,
      startDate,
      endDate,
      titleImg,
      bgImg,
      isQnA,
      isSecret,
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

async function postMessage({
  message,
  instantEventId,
  showOnlyAdmin,
  category,
}: {
  message: string;
  instantEventId: string;
  showOnlyAdmin: boolean;
  category?: string;
}) {
  if (message.length <= 0) {
    return {
      result: false,
      message: '메시지를 입력해주세요',
    };
  }
  try {
    await TownhallClientService.post({
      instantEventId,
      message,
      showOnlyAdmin,
      category,
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

const TownhallHomePage: NextPage<Props> = function ({ instantEventInfo: propsEventInfo }) {
  const toast = useToast();
  const { query } = useRouter();
  const { authUser, isOwner, token, signInWithGoogle } = useAuth();
  const [msgCategory] = useState<string | undefined>(undefined);
  const [message, updateMessage] = useState('');
  const [editorActive, setEditorActive] = useState(false);
  const [showOnlyAdmin] = useState(false);
  const [instantEventInfo, setInstantEventInfo] = useState(propsEventInfo);
  const [listLoadTrigger, setListLoadTrigger] = useState(false);
  const [messageList, setMessageList] = useState<InInstantEventMessage[]>([]);
  const [sortRule] = useState<'latest' | 'most_liked' | 'onlyShowAdmin'>('latest');
  const [uniqueVoterCount, setUniqueVoterCount] = useState(0);
  // 접속한 사용자가 만든 이벤트인지 확인한다
  const isCreator = authUser?.uid === instantEventInfo?.createId;
  const eventState = TownhallUtil.calEventState(instantEventInfo);
  const [showPresentation, setShowPresentation] = useState(false);
  console.log('eventState', eventState);

  const sortedMessageList = useMemo(() => {
    if (sortRule === 'latest') {
      return [...messageList].sort((a, b) => (a.createAt < b.createAt ? 1 : -1));
    }
    if (sortRule === 'most_liked') {
      return [...messageList].sort((a, b) => ((a.reaction?.length ?? 0) < (b.reaction?.length ?? 0) ? 1 : -1));
    }
    if (sortRule === 'onlyShowAdmin') {
      return messageList.filter((fv) => fv.showOnlyAdmin === true);
    }
    return [...messageList].sort((a, b) => (a.sortWeight < b.sortWeight ? 1 : -1));
  }, [messageList, sortRule]);

  const [isSending, setSending] = useState(false);

  const isPreview = (() => {
    if (query.isPreview === undefined) return false;
    if (typeof query.isPreview === 'string') return query.isPreview === 'true';
    return query.isPreview[0] === 'true';
  })();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const messageListQueryKey = ['chatMessageList', instantEventInfo?.instantEventId, authUser, listLoadTrigger];
  const { status, refetch } = useQuery(
    messageListQueryKey,
    async () => {
      const extractToken = await FirebaseAuthClient.getInstance().Auth.currentUser?.getIdToken();
      const resp = await axios.get<{ list: InInstantEventMessage[]; uniqueVoterCount: number }>(
        `/api/division-town-hall/messages.list_with_voter_count/${instantEventInfo?.instantEventId}?isPreview=${isPreview}`,
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
      enabled: token !== null,
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
    isQnA?: boolean;
    isSecret?: boolean;
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
    <DivMeetingServiceLayout
      minH="100vh"
      backgroundColor="gray.200"
      bgImage={instantEventInfo.bgImg ?? undefined}
      bgSize="100% auto"
      bgRepeat="no-repeat"
      title="부문/센터타운홀Q&A"
      pt={16}
    >
      <Box maxW="xl" mx="auto" pt="6" bgColor="gray.200">
        {(isOwner || isCreator) && isPreview === false && (
          <Box mb="2">
            <Link href="/division-town-hall">
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
        <CreateTownhallEvent
          isShow={isOpen}
          mode="MODIFY"
          origin={{ ...instantEventInfo }}
          onClose={onClose}
          onClickSave={(saveData) => {
            modify({ ...saveData, instantEventId: instantEventInfo.instantEventId })
              .then(() =>
                TownhallClientService.get({
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
                <TownhallHeaderSideMenu
                  instantEventInfo={instantEventInfo}
                  eventState={eventState}
                  onCompleteLockOrClose={() => {
                    TownhallClientService.get({
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
          <TownhallInfo
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
          <Box borderWidth="1px" borderRadius="lg" p="2" overflow="hidden" bg="white" mt="2">
            {!editorActive ? (
              <Box
                p="3"
                borderRadius="md"
                bg="gray.100"
                color="gray.500"
                cursor="pointer"
                fontSize="sm"
                _hover={{ bg: 'gray.200' }}
                onClick={() => setEditorActive(true)}
                width="100%"
              >
                질문이 몽글몽글 떠오른다면? 여기로!
              </Box>
            ) : (
              <>
                <TiptapEditor
                  value={message}
                  onChange={(value: string) => {
                    updateMessage(value);
                  }}
                  placeholder="질문이 몽글몽글 떠오른다면? 여기로!"
                />
                <Button
                  isLoading={isSending}
                  disabled={isSending || message.trim().length <= 0}
                  bgColor={`${ColorPalette.mint}`}
                  textColor="white"
                  _hover={{ bg: ColorPalette.mint_disabled }}
                  variant="solid"
                  mt="2"
                  width="full"
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
                      category: msgCategory,
                      instantEventId: instantEventInfo.instantEventId,
                      showOnlyAdmin,
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
                    setListLoadTrigger((prev) => !prev);
                    updateMessage('');
                    setSending(false);
                    setEditorActive(false);
                  }}
                >
                  등록
                </Button>
              </>
            )}
          </Box>
        )}
        {authUser === null && (
          <Box maxW="xl" mx="auto" minH="80vh">
            <Center marginBottom="10" p="6">
              <Box>
                <img src="/none_message.png" alt="hero" />
                <Flex justify="center" alignItems="center" flexDir="column">
                  <Heading>부문/센터 타운홀</Heading>
                  <Text>이 서비스는 우아한형제들 임직원용 서비스입니다.</Text>
                </Flex>
              </Box>
            </Center>
            <GoogleLoginButton
              isStart={false}
              onClickLogin={() => {
                signInWithGoogle(`/division-town-hall/${instantEventInfo.instantEventId}`);
              }}
            />
          </Box>
        )}
        {authUser !== null && (
          <DivMeetingMessageList
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
            onDeleteComplete={() => {
              refetch();
            }}
          />
        )}
        <Presentation
          messageList={sortedMessageList.filter((fv) => fv.deny === undefined || fv.deny === false)}
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
    </DivMeetingServiceLayout>
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
    const instantInfo = await TownhallClientService.get({
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

export default TownhallHomePage;
