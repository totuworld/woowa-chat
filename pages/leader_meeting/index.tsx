import { NextPage } from 'next';
import { Box } from '@chakra-ui/react';
import ChatList from '@/features/leader_meeting/chat_list';
import { LeaderServiceLayout } from '@/features/leader_meeting/service_layout';

/** 우수타 이벤트 목록 페이지
 *
 * 진입 가능한 이벤트 목록을 보여준다.
 * 관리자 계정인 경우에만 이벤트 생성 메뉴를 보여준다.
 *
 */
const ListPage: NextPage = function () {
  return (
    <LeaderServiceLayout height="100vh" backgroundColor="gray.50" title="리더십타운홀 Q&A" pt={16}>
      <Box maxW="xl" mx="auto" minH="95vh" overflow="scroll; height:200px;">
        <ChatList />
      </Box>
    </LeaderServiceLayout>
  );
};

export default ListPage;
