import { NextPage } from 'next';
import { Box } from '@chakra-ui/react';
import { ServiceLayout } from '@/components/containers/service_layout';
import ChatList from '@/features/instant_message/chat_list';

/** 우수타 이벤트 목록 페이지
 *
 * 진입 가능한 이벤트 목록을 보여준다.
 * 관리자 계정인 경우에만 이벤트 생성 메뉴를 보여준다.
 *
 */
const ListPage: NextPage = function () {
  return (
    <ServiceLayout height="100vh" backgroundColor="gray.50" title="우수타 공감톡톡">
      <Box maxW="xl" mx="auto">
        <ChatList />
      </Box>
    </ServiceLayout>
  );
};

export default ListPage;
