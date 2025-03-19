import { useState } from 'react';
import { NextPage } from 'next';
import axios from 'axios';
import { useQuery } from 'react-query';
import { Badge, Box, Button, Flex, Spacer, Spinner, Text, useDisclosure, useToast } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { useAuth } from '@/contexts/auth_user.context';

import 'antd/dist/antd.css';
import CreateTownhallEvent from '@/features/town-hall/create_town_hall.component';
import TownhallClientService from '@/features/town-hall/townhall.client.service';
import { InInstantEvent } from '@/models/instant_message/interface/in_instant_event';
import TownhallUtil from '@/features/town-hall/townhall.util';
import TownhallHeaderSideMenu from '@/features/town-hall/header/side_menu.component';
import { TownhallServiceLayout } from '@/features/town-hall/service_layout';
import TownhallMainInfo from '@/features/town-hall/main_info';

async function createEvent({
  title,
  desc,
  startDate,
  endDate,
  titleImg,
  bgImg,
  isQnA,
}: {
  title: string;
  desc?: string;
  startDate?: string;
  endDate?: string;
  titleImg?: string;
  bgImg?: string;
  isQnA?: boolean;
}) {
  if (title.length <= 0) {
    return {
      result: false,
      message: '제목을 입력해주세요',
    };
  }
  try {
    const resp = await TownhallClientService.create({ title, desc, startDate, endDate, titleImg, bgImg, isQnA });
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

const TownHallMeetingPage: NextPage = function () {
  const { isOwner, authUser } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const [listLoadTrigger, setListLoadTrigger] = useState(false);
  const [eventList, setEventList] = useState<InInstantEvent[]>([]);

  async function create(data: {
    title: string;
    desc?: string;
    startDate?: string;
    endDate?: string;
    titleImg?: string;
    bgImg?: string;
    isQnA?: boolean;
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

  const queryKey = ['townhallEventList', listLoadTrigger];
  const { status } = useQuery(
    queryKey,
    // eslint-disable-next-line no-return-await
    async () => await axios.get<InInstantEvent[]>('/api/town-hall/list'),
    {
      enabled: authUser !== null,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        if (data.status === 200 && data.data) {
          setEventList(data.data);
        }
      },
    },
  );

  return (
    <TownhallServiceLayout height="100vh" backgroundColor="gray.50" title="타운홀Q&A" pt={16}>
      <Box maxW="xl" mx="auto" minH="95vh" overflow="scroll; height:200px;">
        <Box>
          {isOwner && !isOpen && (
            <Button
              mt="6"
              width="full"
              onClick={() => {
                onOpen();
              }}
            >
              전사타운홀Q&A 생성
            </Button>
          )}
        </Box>
        <CreateTownhallEvent
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
            const eventState = TownhallUtil.calEventState(eventInfo);
            const badgeColor = (() => {
              if (eventState === 'closed' || eventState === 'locked') return 'red';
              if (eventState === 'question') return 'green';
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
                <Badge colorScheme={badgeColor}>{TownhallUtil.EventStateTOKorText[eventState]}</Badge>
                <Text style={{ marginLeft: '10px' }}>{eventInfo.title}</Text>
                <Spacer />
                <Button
                  size="xs"
                  style={{ marginRight: '10px' }}
                  rightIcon={<ExternalLinkIcon />}
                  onClick={() => {
                    router.push(`/town-hall-meeting/${eventInfo.instantEventId}`);
                  }}
                >
                  이동
                </Button>
                <TownhallHeaderSideMenu
                  instantEventInfo={eventInfo}
                  eventState={eventState}
                  onCompleteLockOrClose={() => {
                    TownhallClientService.get({
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
            <img style={{ width: '50%', margin: '0 auto' }} src="none_message.png" alt="목록 없음" />
            <Flex justify="center">
              <Box mb="6" height="100vh" fontSize="sm">
                생성된 이벤트가 없어요.
              </Box>
            </Flex>
          </Box>
        )}
        {authUser === null && <TownhallMainInfo />}
      </Box>
    </TownhallServiceLayout>
  );
};

export default TownHallMeetingPage;
