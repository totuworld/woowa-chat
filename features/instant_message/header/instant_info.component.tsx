import { Box, Center, Image, Text } from '@chakra-ui/react';
import moment from 'moment';
import { InInstantEvent } from '@/models/instant_message/interface/in_instant_event';

interface Props {
  instantEventInfo: InInstantEvent;
  eventState: 'none' | 'locked' | 'closed' | 'question' | 'reply' | 'pre' | 'showAll';
  isPreview: boolean;
}

const DEFAULT_IMG = '/default_title.png';

function convertMarkdownLinksToJsx(text: string): (string | JSX.Element)[] {
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;

  const parts = text.split(regex);

  const jsxParts = parts.reduce((acc: (string | JSX.Element)[], part, index) => {
    if (index % 3 === 1) {
      // 홀수 인덱스는 링크 텍스트
      const linkUrl = parts[index + 1];
      acc.push(
        <a href={linkUrl} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 'bold' }}>
          {part}
        </a>,
      );
    }
    if (index % 3 === 0) {
      acc.push(part);
    }
    return acc;
  }, []);

  return jsxParts;
}

function convertMarkdownBoldToJsx(text: (string | JSX.Element)[]): (string | JSX.Element)[] {
  return text
    .map((part) => {
      if (typeof part === 'string') {
        const parts = part.split(/\*\*(.*?)\*\*/gm);
        if (parts.length === 3) {
          return [parts[0], <b>{parts[1]}</b>, parts[2]];
        }
      }
      return part;
    })
    .flat();
}

const InstantInfo = function ({ instantEventInfo, eventState, isPreview }: Props) {
  const endDate = moment(instantEventInfo.endDate, moment.ISO_8601);
  const printDesc = instantEventInfo?.desc ? instantEventInfo!.desc.replace(/\\n/gi, '\n') : '';
  const bodyText = convertMarkdownBoldToJsx(convertMarkdownLinksToJsx(printDesc));
  return (
    <>
      <Image src={instantEventInfo.titleImg ?? DEFAULT_IMG} objectFit="cover" />
      <Box px="2" pb="2">
        <Text fontSize="md">{instantEventInfo?.title}</Text>
        <Text fontSize="xs" style={{ whiteSpace: 'pre-line' }}>
          {bodyText}
        </Text>
        {eventState === 'question' && <Text fontSize="xs">{endDate.format('YYYY-MM-DD hh:mm')}까지 질문 가능</Text>}
        {/* {eventState === 'locked' && (
          <Center width="full" fontSize="xs">
            🚨 더 이상 댓글을 달 수 없는 상태입니다 🚨
          </Center>
        )} */}
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
