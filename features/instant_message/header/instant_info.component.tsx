import { Box, Center, Image, Text } from '@chakra-ui/react';
import moment from 'moment';
import { InInstantEvent } from '@/models/instant_message/interface/in_instant_event';

interface Props {
  instantEventInfo: InInstantEvent;
  eventState: 'none' | 'locked' | 'closed' | 'question' | 'reply' | 'pre' | 'showAll';
  isPreview: boolean;
}

const DEFAULT_IMG = '/default_title.png';

const InstantInfo = function ({ instantEventInfo, eventState, isPreview }: Props) {
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
        {isPreview === true && (
          <Center width="full" fontSize="xs">
            🎨 프리뷰 모드 🎨
          </Center>
        )}
      </Box>
    </>
  );
};

export default InstantInfo;
