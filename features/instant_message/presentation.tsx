import { Box, Button, Spacer, Stack } from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { InInstantEventMessage } from '@/models/instant_message/interface/in_instant_event_message';
import IconDown from './message_item/icon_down';
import IconUp from './message_item/icon_up';

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

interface Props {
  messageList: InInstantEventMessage[];
  show: boolean;
  turnOff: () => void;
}

const Presentation = function ({ messageList, show, turnOff }: Props) {
  const [currentIndex, setIndex] = useState(0);
  const currentMessage = messageList[currentIndex];
  const [fontSize, setFontSize] = useState('lg');
  const printMessage = (() => {
    if (currentMessage === undefined) {
      return '';
    }
    const linkText = convertMarkdownLinksToJsx(currentMessage.message);
    return convertMarkdownBoldToJsx(linkText);
  })();

  const handleKeyPress = useCallback(
    (event) => {
      // 키보드 이벤트를 받아서 setIndex를 1씩 증가시키거나 감소시킵니다.
      if (event.key === 'ArrowRight') {
        setIndex((prev) => (prev + 1) % messageList.length);
      }
      if (event.key === 'ArrowLeft') {
        setIndex((prev) => (prev - 1 + messageList.length) % messageList.length);
      }
      // +와 - 키를 누르면 폰트 사이즈를 변경합니다.
      if (event.key === '=' && fontSize === 'md') {
        setFontSize('lg');
        return;
      }
      if (event.key === '=' && fontSize === 'lg') {
        setFontSize('xl');
        return;
      }
      if (event.key === '+' && fontSize === 'md') {
        setFontSize('lg');
        return;
      }
      if (event.key === '+' && fontSize === 'lg') {
        setFontSize('xl');
        return;
      }
      if (event.key === '-' && fontSize === 'xl') {
        setFontSize('lg');
        return;
      }
      if (event.key === '-' && fontSize === 'lg') {
        setFontSize('md');
      }
      // esc 키를 누르면 turnOff 함수를 실행합니다.
      if (event.key === 'Escape') {
        turnOff();
      }
    },
    [fontSize, setIndex, messageList, turnOff],
  );

  useEffect(() => {
    // attach the event listener
    document.addEventListener('keydown', handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  const memoReaction = useMemo(() => {
    // 현재 메시지
    const targetMessage = messageList[currentIndex];
    // 현재 메시지의 reaction
    const reaction = targetMessage?.reaction;
    // reaction이 없으면 빈 배열을 반환
    if (reaction === undefined) {
      return { LIKE: 0, HAHA: 0, WOW: 0, SAD: 0, ANGRY: 0, DOWN: 0, CARE: 0 };
    }
    // reaction이 존재하면 각각의 reaction의 개수를 세어 반환
    return reaction.reduce(
      (acc, cur) => {
        acc[cur.type] += 1;
        return acc;
      },
      { LIKE: 0, HAHA: 0, WOW: 0, SAD: 0, ANGRY: 0, DOWN: 0, CARE: 0 },
    );
  }, [currentIndex, messageList]);

  return (
    <Box
      display={show ? 'flex' : 'none'}
      zIndex={10}
      width="full"
      height="full"
      backgroundColor="blackAlpha.900"
      position="absolute"
      top="50%"
      left="50%"
      transform="translate(-50%, -50%)"
    >
      <Box
        backgroundColor="white"
        borderRadius="md"
        paddingX="10"
        paddingTop="1"
        paddingBottom="10"
        marginX="auto"
        marginY="auto"
        fontSize={fontSize}
        maxW="1600px"
        maxH="800px"
        display="flex"
        flexDirection="column"
      >
        <Stack direction="row" align="center" marginBottom="9">
          <Box fontSize="xs" key="message-count">
            {currentIndex + 1} / {messageList.length}
          </Box>
          <Box display="flex" alignItems="center" fontSize="xs" key="icon-up">
            <IconUp size={16} active={memoReaction.LIKE > 0} />
            {memoReaction.LIKE}
          </Box>
          <Box display="flex" alignItems="center" fontSize="xs" key="icon-down">
            <IconDown size={16} active={memoReaction.DOWN > 0} />
            {memoReaction.DOWN}
          </Box>
          <Spacer />
          <Button
            size="xs"
            key="btn-md"
            variant={fontSize === 'md' ? 'outline' : 'ghost'}
            onClick={() => {
              setFontSize('md');
            }}
          >
            작은
          </Button>
          <Button
            key="btn-lg"
            size="xs"
            variant={fontSize === 'lg' ? 'outline' : 'ghost'}
            onClick={() => {
              setFontSize('lg');
            }}
          >
            보통
          </Button>
          <Button
            key="btn-xl"
            size="xs"
            variant={fontSize === 'xl' ? 'outline' : 'ghost'}
            onClick={() => {
              setFontSize('xl');
            }}
          >
            큰
          </Button>
        </Stack>
        <Box
          overflowY="scroll"
          style={{
            scrollbarWidth: 'none',
          }}
        >
          {printMessage}
        </Box>
      </Box>
    </Box>
  );
};

export default Presentation;
