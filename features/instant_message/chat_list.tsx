import { Box, Button, Flex, Spacer, useDisclosure, useToast, Text, Badge, Spinner } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/auth_user.context';
import 'antd/dist/antd.css';
import { InInstantEvent } from '@/models/instant_message/interface/in_instant_event';
import ChatClientService from './chat.client.service';
import InstantEventHeaderSideMenu from './header/side_menu.component';
import InstantEventUtil from './instant_event.util';
import CreateEvent from './create_event.component';

async function createEvent({
  title,
  desc,
  startDate,
  endDate,
  titleImg,
  bgImg,
}: {
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
    const resp = await ChatClientService.create({ title, desc, startDate, endDate, titleImg, bgImg });
    return {
      result: true,
      instantEventId: resp.payload?.instantEventId,
    };
  } catch (err) {
    console.error(err);
    return {
      result: false,
      message: '생성 실패',
    };
  }
}

const ChatList = function () {
  const { isOwner } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();

  const [eventList, setEventList] = useState<InInstantEvent[]>([]);

  const [listLoadTrigger, setListLoadTrigger] = useState(false);

  const queryKey = ['chatEventList', listLoadTrigger];

  const { status } = useQuery(
    queryKey,
    // eslint-disable-next-line no-return-await
    async () => await axios.get<InInstantEvent[]>('/api/instant-event.list'),
    {
      enabled: true,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        if (data.status === 200 && data.data) {
          setEventList(data.data);
        }
      },
    },
  );

  async function create(data: {
    title: string;
    desc?: string;
    startDate?: string;
    endDate?: string;
    titleImg?: string;
    bgImg?: string;
  }) {
    const resp = await createEvent(data);
    if (resp.result === false) {
      toast({
        title: '이벤트 생성 실패',
        position: 'top-right',
      });
    }
    if (resp.result === true) {
      toast({
        title: '이벤트 생성 성공',
        position: 'top-right',
      });
    }
    setListLoadTrigger((prev) => !prev);
  }

  return (
    <>
      <Box>
        {isOwner && !isOpen && (
          <Button
            mt="6"
            width="full"
            onClick={() => {
              onOpen();
            }}
          >
            우수타 이벤트 생성
          </Button>
        )}
      </Box>
      <CreateEvent
        isShow={isOpen}
        mode="CREATE"
        onClose={onClose}
        onClickSave={(saveData) => {
          create(saveData).then(() => {
            onClose();
          });
        }}
      />
      <Box spacing="12px" mt="6">
        {eventList.map((eventInfo) => {
          const eventState = InstantEventUtil.calEventState(eventInfo);
          const badgeColor = (() => {
            if (eventState === 'closed' || eventState === 'locked') return 'red';
            if (eventState === 'question' || eventState === 'reply') return 'green';
            return 'gray';
          })();
          return (
            <Flex
              key={`instantEventKey-${eventInfo.instantEventId}`}
              bg="white"
              p="2"
              alignItems="center"
              borderRadius="md"
              mb="2"
            >
              <Badge colorScheme={badgeColor}>{InstantEventUtil.EventStateTOKorText[eventState]}</Badge>
              <Text style={{ marginLeft: '10px' }}>{eventInfo.title}</Text>
              <Spacer />
              <Button
                size="xs"
                style={{ marginRight: '10px' }}
                rightIcon={<ExternalLinkIcon />}
                onClick={() => {
                  router.push(`/list/${eventInfo.instantEventId}`);
                }}
              >
                이동
              </Button>
              <InstantEventHeaderSideMenu
                instantEventInfo={eventInfo}
                eventState={eventState}
                onCompleteLockOrClose={() => {
                  ChatClientService.get({
                    instantEventId: eventInfo.instantEventId,
                  }).then((resp) => {
                    if (resp.status === 200 && resp.payload !== undefined) {
                      setEventList((prev) => {
                        const updateArr = [...prev];
                        const findIndex = prev.findIndex((fv) => {
                          const checked = fv.instantEventId === resp.payload!.instantEventId;
                          return checked;
                        });
                        if (findIndex > -1 && updateArr[findIndex] !== undefined && resp.payload !== undefined) {
                          updateArr[findIndex] = resp.payload;
                        }
                        return updateArr;
                      });
                    }
                  });
                }}
              />
            </Flex>
          );
        })}
      </Box>
      {!(status === 'success' || status === 'error') && isOwner && (
        <Flex alignContent="center" justifyContent="center" paddingTop="100">
          <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
        </Flex>
      )}
      {(status === 'success' || status === 'error') && eventList.length === 0 && isOwner && (
        <Box mt="6">
          <img style={{ width: '50%', margin: '0 auto' }} src="/sorry@2x.png" alt="목록 없음" />
          <Flex justify="center">
            <Box mb="6" height="100vh" fontSize="sm">
              생성된 이벤트가 없어요.
            </Box>
          </Flex>
        </Box>
      )}
    </>
  );
};

export default ChatList;
