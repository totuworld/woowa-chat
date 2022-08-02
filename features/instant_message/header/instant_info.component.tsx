import { Box, Center, Image, Text } from '@chakra-ui/react';
import moment from 'moment';
import { InInstantEvent } from '@/models/instant_message/interface/in_instant_event';

interface Props {
  instantEventInfo: InInstantEvent;
  eventState: 'none' | 'locked' | 'closed' | 'question' | 'reply' | 'pre';
}

const DEFAULT_IMG =
  'https://images.unsplash.com/photo-1590372648787-fa5a935c2c40?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=640&q=80';

const InstantInfo = function ({ instantEventInfo, eventState }: Props) {
  const endDate = moment(instantEventInfo.endDate, moment.ISO_8601);
  const printDesc = instantEventInfo?.desc ? instantEventInfo!.desc.replace(/\\n/gi, '\n') : '';
  return (
    <>
      <Image src={instantEventInfo.titleImg ?? DEFAULT_IMG} objectFit="cover" />
      <Box px="2" pb="2">
        <Text fontSize="md">{instantEventInfo?.title}</Text>
        <Text fontSize="xs" style={{ whiteSpace: 'pre-line' }}>
          {printDesc}
        </Text>
        {eventState === 'question' && <Text fontSize="xs">{endDate.format('YYYY-MM-DD hh:mm')}까지 질문 가능</Text>}
        {eventState === 'locked' && (
          <Center width="full" fontSize="xs">
            🚨 더 이상 댓글을 달 수 없는 상태입니다 🚨
          </Center>
        )}
        {eventState === 'closed' && (
          <Center width="full" fontSize="xs">
            🚨 종료된 이벤트 입니다 🚨
          </Center>
        )}
      </Box>
    </>
  );
};

export default InstantInfo;
