import { useState } from 'react';
import { NextPage } from 'next';
import axios from 'axios';
import { useQuery } from 'react-query';
import { Badge, Box, Button, Flex, Spacer, Spinner, Text, useDisclosure, useToast } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { useAuth } from '@/contexts/auth_user.context';

import 'antd/dist/antd.css';
import CreateTownhallEvent from '@/features/division-town-hall/create_town_hall.component';
import TownhallClientService from '@/features/division-town-hall/divmeeting.client.service';
import { InInstantEvent } from '@/models/instant_message/interface/in_instant_event';
import TownhallUtil from '@/features/division-town-hall/divmeeting.util';
import TownhallHeaderSideMenu from '@/features/division-town-hall/header/side_menu.component';
import { DivMeetingServiceLayout } from '@/features/division-town-hall/service_layout';
import MainInfo from '@/features/division-town-hall/main_info';
import FirebaseAuthClient from '@/models/auth/firebase_auth_client';

async function createEvent({
  title,
  townhallType,
  desc,
  startDate,
  endDate,
  titleImg,
  bgImg,
  isSecret,
  createrId,
}: {
  title: string;
  townhallType: 'division' | 'center';
  desc?: string;
  startDate?: string;
  endDate?: string;
  titleImg?: string;
  bgImg?: string;
  isSecret?: boolean;
  createrId: string;
}) {
  if (title.length <= 0) {
    return {
      result: false,
      message: '제목을 입력해주세요',
    };
  }
  try {
    const resp = await TownhallClientService.create({
      title,
      townhallType,
      createId: createrId,
      desc,
      startDate,
      endDate,
      titleImg,
      bgImg,
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
      message: '생성 실패',
    };
  }
}

const DivMeetingPage: NextPage = function () {
  const { isOwner, authUser } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const [listLoadTrigger, setListLoadTrigger] = useState(false);
  const [eventList, setEventList] = useState<InInstantEvent[]>([]);

  async function create(data: {
    title: string;
    townhallType: 'division' | 'center';
    desc?: string;
    startDate?: string;
    endDate?: string;
    titleImg?: string;
    bgImg?: string;
    isSecret?: boolean;
  }) {
    const resp = await createEvent({ ...data, createrId: authUser!.uid });
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
    async () => {
      const extractToken = await FirebaseAuthClient.getInstance().Auth.currentUser?.getIdToken();
      const resp = await axios.get<InInstantEvent[]>('/api/division-town-hall/list', {
        headers: extractToken
          ? {
              authorization: extractToken,
            }
          : {},
      });
      return resp;
    },
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
    <DivMeetingServiceLayout height="100vh" backgroundColor="gray.50" title="타운홀Q&A" pt={16}>
      <Box maxW="xl" mx="auto" minH="95vh" overflow="scroll; height:200px;">
        <Box>
          {!isOpen && (
            <Button
              mt="6"
              width="full"
              onClick={() => {
                onOpen();
              }}
            >
              부문/센터 타운홀Q&A 생성
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
                    router.push(`/division-town-hall/${eventInfo.instantEventId}`);
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
        {authUser === null && <MainInfo />}
      </Box>
    </DivMeetingServiceLayout>
  );
};

export default DivMeetingPage;
