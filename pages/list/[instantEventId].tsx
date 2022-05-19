import { GetServerSideProps, NextPage } from 'next';
import { Avatar, Box, Button, Flex, Spacer, Textarea, useToast, VStack } from '@chakra-ui/react';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import Link from 'next/link';
import ResizeTextarea from 'react-textarea-autosize';
import { useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import moment from 'moment';
import { ServiceLayout } from '@/components/containers/service_layout';
import { InInstantEvent } from '@/models/instant_message/interface/in_instant_event';
import { InInstantEventMessage } from '@/models/instant_message/interface/in_instant_event_message';
import { getBaseUrl } from '@/utils/get_base_url';
import getStringValueFromQuery from '@/utils/get_value_from_query';
import InstantInfo from '@/features/instant_message/header/instant_info.component';
import FirebaseAuthClient from '@/models/auth/firebase_auth_client';
import { useAuth } from '@/contexts/auth_user.context';
import InstantMessageItem from '@/features/instant_message/message_item/instant_message_item.component';
import InstantEventHeaderSideMenu from '@/features/instant_message/header/side_menu.component';
import ChatClientService from '@/features/instant_message/chat.client.service';

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
  const { authUser, isOwner } = useAuth();
  const [message, updateMessage] = useState('');
  const [instantEventInfo, setInstantEventInfo] = useState(propsEventInfo);
  const [listLoadTrigger, setListLoadTrigger] = useState(false);
  const [messageList, setMessageList] = useState<InInstantEventMessage[]>([]);
  const sortedMessageList = useMemo(() => [...messageList].sort((a, b) => b.sortWeight - a.sortWeight), [messageList]);

  const eventState = (() => {
    if (instantEventInfo === null) {
      return 'none';
    }
    if (
      instantEventInfo.locked !== undefined &&
      instantEventInfo.locked === true &&
      instantEventInfo.closed === false
    ) {
      // 잠긴경우
      return 'locked';
    }
    if (instantEventInfo.closed === true) {
      // 완전히 종료된 경우
      return 'closed';
    }
    const now = moment();
    const startDate = moment(instantEventInfo.startDate, moment.ISO_8601);
    const endDate = moment(instantEventInfo.endDate, moment.ISO_8601);
    // 질문 가능한 기간 내 인가?
    if (now.isBetween(startDate, endDate, undefined, '[]')) {
      return 'question';
    }
    // 질문 가능한 기간이 넘었나?
    if (now.isAfter(endDate)) {
      return 'reply';
    }
    return 'pre';
  })();

  const messageListQueryKey = ['chatMessageList', instantEventInfo?.instantEventId, authUser, listLoadTrigger];
  useQuery(
    messageListQueryKey,
    async () => {
      const token = await FirebaseAuthClient.getInstance().Auth.currentUser?.getIdToken();
      const resp = await axios.get<InInstantEventMessage[]>(
        `/api/instant-event.messages.list/${instantEventInfo?.instantEventId}`,
        {
          headers: token
            ? {
                authorization: token,
              }
            : {},
        },
      );
      return resp;
    },
    {
      enabled: eventState === 'reply' || eventState === 'locked' || isOwner,
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

  return (
    <ServiceLayout height="100vh" backgroundColor="gray.200">
      <Box maxW="xl" mx="auto" pt="6">
        <Link href="/list">
          <a>
            <Button fontSize="sm" mb="2" leftIcon={<ChevronLeftIcon />}>
              리스트로 이동
            </Button>
          </a>
        </Link>
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
          <InstantInfo instantEventInfo={instantEventInfo} eventState={eventState} />
        </Box>
        {eventState === 'question' && (
          <Box borderWidth="1px" borderRadius="lg" p="2" overflow="hidden" bg="white" mt="6">
            <Flex>
              <Box pt="1" pr="2">
                <Avatar size="xs" src="https://bit.ly/broken-link" />
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
                  // 최대 7줄만 스크린샷에 표현되니 7줄 넘게 입력하면 제한걸어야한다.
                  if (e.target.value) {
                    const lineCount = (e.target.value.match(/[^\n]*\n[^\n]*/gi)?.length ?? 1) + 1;
                    if (lineCount > 7) {
                      toast({
                        title: '최대 7줄까지만 입력가능합니다',
                        position: 'top-right',
                      });
                      return;
                    }
                  }
                  updateMessage(e.target.value);
                }}
              />
              <Button
                disabled={message.length === 0}
                bgColor="#FFB86C"
                color="white"
                colorScheme="yellow"
                variant="solid"
                size="sm"
                onClick={async () => {
                  const resp = await postMessage({
                    message,
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
                }}
              >
                등록
              </Button>
            </Flex>
          </Box>
        )}
        {(eventState === 'reply' || eventState === 'locked' || isOwner) && (
          <VStack spacing="12px" mt="6">
            {sortedMessageList.map((item) => (
              <InstantMessageItem
                key={`instant-message-${instantEventInfo.instantEventId}-${item.id}`}
                instantEventId={instantEventInfo.instantEventId}
                item={item}
                locked={eventState === 'locked'}
                onSendComplete={() => {
                  console.info('send complete');
                  ChatClientService.getMessageInfo({
                    instantEventId: instantEventInfo.instantEventId,
                    messageId: item.id,
                  }).then((info) => {
                    if (info.payload === undefined) {
                      return;
                    }
                    setMessageList((prev) => {
                      const findPrevIndex = prev.findIndex((fv) => fv.id === info.payload!.id);
                      if (findPrevIndex < 0) {
                        return prev;
                      }
                      const updateArr = [...prev];
                      updateArr[findPrevIndex] = info.payload!;
                      return updateArr;
                    });
                  });
                }}
              />
            ))}
          </VStack>
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
