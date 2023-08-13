import { NextPage } from 'next';
import getConfig from 'next/config';
import Head from 'next/head';
import { useQuery, useInfiniteQuery } from 'react-query';
import axios from 'axios';
import 'antd/dist/antd.css';
import { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Switch, useDisclosure, useToast } from '@chakra-ui/react';
import { ServiceLayout } from '@/components/containers/service_layout';
import { useAuth } from '@/contexts/auth_user.context';
import MainInfo from '@/features/home/MainInfo';
import EventList from '@/features/home/EventList';
import { InInstantEvent } from '@/models/instant_message/interface/in_instant_event';
import EventListWithPage from '@/features/home/EventListWithPage';
import CreateEvent from '@/features/instant_message/create_event.component';
import ChatClientService from '@/features/instant_message/chat.client.service';

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

/** 최초 진입 페이지
 *
 * 가입 유도 문구
 *
 */
const IndexPage: NextPage = function () {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { publicRuntimeConfig } = getConfig();
  const mainUrl = `https://${publicRuntimeConfig.mainDomain}`;
  const { authUser, isOwner } = useAuth();
  const [isAdminMode, setAdminMode] = useState(false);
  const [listLoadTrigger, setListLoadTrigger] = useState(false);

  const { data: eventList } = useQuery(
    ['chatEventList_for_main', isAdminMode, listLoadTrigger],
    // eslint-disable-next-line no-return-await
    async () => await axios.get<InInstantEvent[]>('/api/instant-event.list'),
    {
      enabled: authUser !== null && isAdminMode === false,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      select: (data) => {
        if (data.status === 200 && data.data) {
          const filterData = data.data.filter(
            (fv) => fv.closed === false && (fv.locked !== undefined ? fv.locked === false : true),
          );
          return filterData;
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

  // useQuery(
  //   ['chatEventList_withpage_for_main', isAdminMode, page],
  //   async () =>
  //     // eslint-disable-next-line no-return-await
  // await axios.get<{
  //   totalElements: number;
  //   totalPages: number;
  //   page: number;
  //   size: number;
  //   content: InInstantEvent[];
  // }>(`/api/instant-event.list/page?page=${page}`),
  //   {
  //     enabled: authUser !== null && isAdminMode === true,
  //     keepPreviousData: true,
  //     refetchOnWindowFocus: false,
  //     onSuccess: (data) => {
  //       setEventListWithPage((prev) => {
  //         const older = [...prev];
  //         const newData = data.data.content.filter((fv) => {
  //           const findIdx = older.findIndex((ofv) => fv.instantEventId === ofv.instantEventId);
  //           return findIdx === -1;
  //         });
  //         return [...older, ...newData];
  //       });
  //     },
  //   },
  // );

  const {
    hasNextPage,
    fetchNextPage,
    data: queryData,
  } = useInfiniteQuery(
    ['chatEventList_withpage_for_main', {}],
    async ({ pageParam = 1 }) => {
      // eslint-disable-next-line no-return-await
      const resp = await axios.get<{
        totalElements: number;
        totalPages: number;
        page: number;
        size: number;
        content: InInstantEvent[];
      }>(`/api/instant-event.list/page?page=${pageParam}`);
      return resp.data;
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      getNextPageParam: (lastPage) => lastPage.totalPages > lastPage.page && lastPage.page + 1,
      getPreviousPageParam: (firstPage) => firstPage.page > 1 && firstPage.page - 1,
    },
  );

  return (
    <>
      <Head>
        <meta property="og:url" content={mainUrl} />
        <meta property="og:image" content={`https://${publicRuntimeConfig.mainDomain}/main.jpg`} />
        <meta property="og:site_name" content="우수타 공감톡톡" />
        <meta property="og:title" content="우수타 공감톡톡 - 질문과 댓글 도우미" />
        <meta property="og:description" content="우수타 공감톡톡은 우수타 질문과 댓글을 돕는 서비스입니다." />
        <meta name="twitter:title" content="우수타 공감톡톡 - 질문과 댓글 도우미" />
        <meta name="twitter:description" content="우수타 공감톡톡은 우수타 질문과 댓글을 돕는 서비스입니다." />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`https://${publicRuntimeConfig.mainDomain}/main2.jpg`} />
        <meta name="twitter:image:alt" content="우수타 공감톡톡" />
        <meta name="twitter:url" content={mainUrl} />
        <meta name="twitter:domain" content={publicRuntimeConfig.mainDomain} />
      </Head>
      <ServiceLayout height="100vh" backgroundColor="gray.50" title="우수타 공감톡톡">
        <Box maxW="xl" mx="auto" pl="2">
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
        </Box>
        {isOwner && (
          <Box maxW="xl" mx="auto" pl="2">
            <FormControl display="flex" alignItems="center" mt="1">
              <Switch
                colorScheme="orange"
                id="anonymous"
                mr="1"
                isChecked={isAdminMode}
                onChange={() => {
                  if (authUser === null) {
                    toast({
                      title: '로그인이 필요합니다',
                      position: 'top-right',
                    });
                    return;
                  }
                  setAdminMode((prev) => !prev);
                }}
              />
              <FormLabel htmlFor="anonymous" mb="0">
                전체 목록 조회
              </FormLabel>
            </FormControl>
          </Box>
        )}
        {authUser !== null && isAdminMode === true && queryData?.pages !== undefined && (
          <EventListWithPage pages={queryData.pages} showMoreBtn={hasNextPage} onClickShowMore={fetchNextPage} />
        )}
        {authUser !== null && isAdminMode === false && <EventList eventList={eventList ?? []} />}
        {authUser === null && <MainInfo />}
      </ServiceLayout>
    </>
  );
};

export default IndexPage;
