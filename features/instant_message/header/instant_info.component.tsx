import { Badge, Box, Center, Image, Text } from '@chakra-ui/react';
import moment from 'moment';
import { useMemo } from 'react';
import { InInstantEvent } from '@/models/instant_message/interface/in_instant_event';

interface Props {
  instantEventInfo: InInstantEvent;
  eventState: 'none' | 'locked' | 'closed' | 'question' | 'reply' | 'pre' | 'showAll' | 'adminCheck';
  isPreview: boolean;
  // eslint-disable-next-line react/require-default-props
  uniqueVoterCount?: number;
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

function convertAsterisksToJSX(text: (string | JSX.Element)[]): (string | JSX.Element)[] {
  // 배열의 각 요소를 Array.map 메서드를 사용하여 반복하고, 콜백 함수를 전달합니다.
  const newText = text
    .map((element) => {
      // 요소의 타입을 확인합니다.
      if (typeof element === 'string') {
        // 요소가 문자열인 경우, 정규식을 사용하여 **로 시작하고 끝나는 부분을 찾습니다.
        const regex = /\*\*(.*?)\*\*/g;
        // 위 졍규식을 이용해서 검출된 부분이 어디인지 특정하고, 해당 부분의 index를 확인해서 텍스트로 <b>,</b>태그로 변경시키다.
        const convertedText = element.replace(regex, '<b>$1</b>');
        return convertedText;
      }
      // 요소가 JSX.element인 경우, 그대로 반환합니다.
      return element;
    })
    .map((element) => {
      // 요소의 타입을 확인합니다.
      if (typeof element === 'string') {
        // element에서 <b>로 시작하고 </b>로 끝나는 부분을 찾아서 JSX.element로 변경합니다.
        const regex = /<b>(.*?)<\/b>/i;
        const matchText = element.match(regex);
        if (matchText === null) {
          return element;
        }
        // 만약 matchText.index가 존재한다면!
        const matchIndex = matchText.index!;
        const matchLength = matchText[0].length;
        const matchTextContent = matchText[1];
        // matchText.index를 이용해서 문자열을 잘라내고, 잘라낸 문자열을 <b>로 감싸줍니다.
        const beforeText = element.substring(0, matchIndex);
        const afterText = element.substring(matchIndex + matchLength);
        if (afterText.length >= 0 && afterText.match(regex) !== null) {
          return (
            <>
              {beforeText}
              <b>{matchTextContent}</b>
              {convertAsterisksToJSX([afterText])}
            </>
          );
        }
        return (
          <>
            {beforeText}
            <b>{matchTextContent}</b>
            {afterText}
          </>
        );
      }
      return element;
    })
    .flat();
  // 새로운 배열을 반환합니다.
  return newText;
}

function convertMarkdownBoldToJsx(text: (string | JSX.Element)[]): (string | JSX.Element)[] {
  // text를 순회하면서 \n 문자를 모두 <br />로 변경
  const newLineArray = text
    .map((part) => {
      if (typeof part === 'string') {
        const parts = part.split(/\n/g);
        const jsxParts = parts.reduce((acc: (string | JSX.Element)[], subPart, index) => {
          if (index !== 0) {
            acc.push(<br />);
          }
          acc.push(subPart);
          return acc;
        }, []);
        return jsxParts;
      }
      return part;
    })
    .flat();
  const boldArray = convertAsterisksToJSX(newLineArray);
  return boldArray;
}

// HTML 태그가 있는지 정규식으로 정확히 체크
const hasHtmlTags = (text: string): boolean => {
  // <태그> 또는 </태그> 형식을 찾는 정규식 패턴
  const htmlTagPattern = /<\/?[a-z][^>]*>/i;
  return htmlTagPattern.test(text);
};

const InstantInfo = function ({ instantEventInfo, eventState, isPreview, uniqueVoterCount }: Props) {
  const endDate = moment(instantEventInfo.endDate, moment.ISO_8601);
  const boldTitle = convertMarkdownBoldToJsx([instantEventInfo.title] ?? ['']);
  // item.message 안에 html 요소가 있는지 체크해서 있으면 HTML로 렌더링, 아니라면 마크다운 변환
  const { messageContent, hasHtml } = useMemo(() => {
    if (instantEventInfo?.desc && hasHtmlTags(instantEventInfo?.desc)) {
      return {
        messageContent: instantEventInfo?.desc,
        hasHtml: true,
      };
    }
    const printDesc = instantEventInfo?.desc ? instantEventInfo!.desc.replace(/\\n/gi, '\n') : '';
    const linkText = convertMarkdownLinksToJsx(printDesc);
    return {
      messageContent: convertMarkdownBoldToJsx(linkText),
      hasHtml: false,
    };
  }, [instantEventInfo?.desc]);
  return (
    <>
      <Image src={instantEventInfo.titleImg ?? DEFAULT_IMG} objectFit="cover" />
      <Box px="2" pb="2">
        {instantEventInfo.isAdminOnly === true && <Badge colorScheme="purple">관리자 전용</Badge>}
        <Text fontSize="lg">{boldTitle}</Text>
        {hasHtml ? (
          <Box
            className="html-content"
            fontSize="md"
            sx={{
              '& p': {
                minHeight: '1.5em', // 빈 p 태그에 최소 높이 적용
              },
              '& p:empty': {
                height: '1.5em', // 완전히 빈 p 태그에 명시적 높이 설정
                display: 'block', // 블록 요소로 처리
              },
              '& p:empty::after': {
                content: '"\u00a0"', // 빈 p 태그에 비파괴 공백 추가
                visibility: 'hidden', // 텍스트는 숨김 처리
              },
              '& ul, & ol': {
                paddingLeft: '1.5em', // 목록 왼쪽 여백 설정 (기본값보다 작게)
                marginTop: '0.5em',
                marginBottom: '0.5em',
              },
              '& li': {
                marginBottom: '0.25em', // 목록 항목 간 간격
                display: 'flex', // 플렉스 박스로 변경
                alignItems: 'baseline', // 베이스라인 정렬
              },
              '& li::before': {
                content: '"\u2022"', // 기본 불렛
                marginRight: '0.5em', // 왼쪽 여백
                display: 'inline-block', // 인라인 블록으로 설정
              },
              '& ul': {
                listStyleType: 'none', // 기본 마커 제거
                paddingLeft: '0.5em', // 왼쪽 여백 줄임
              },
              '& ol': {
                counterReset: 'item', // 카운터 초기화
                listStyleType: 'none', // 기본 마커 제거
                paddingLeft: '0.5em', // 왼쪽 여백 줄임
              },
              '& ol > li::before': {
                counterIncrement: 'item', // 항목마다 카운터 증가
                content: 'counter(item) "."', // 숫자.
                marginRight: '0.5em', // 왼쪽 여백
              },
            }}
            dangerouslySetInnerHTML={{ __html: messageContent as string }}
          />
        ) : (
          <Text whiteSpace="pre-line" fontSize="sm">
            {messageContent}
          </Text>
        )}
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
        {uniqueVoterCount !== undefined && (instantEventInfo.isQnA === undefined || instantEventInfo.isQnA === false) && (
          <Text fontSize="sm" style={{ marginTop: '10px' }}>
            전체 투표 참여자수: {uniqueVoterCount}명
          </Text>
        )}
      </Box>
    </>
  );
};

export default InstantInfo;
