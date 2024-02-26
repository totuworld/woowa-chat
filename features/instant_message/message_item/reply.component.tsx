import { Avatar, Box, IconButton, Menu, MenuButton, MenuItem, MenuList, Text, useToast } from '@chakra-ui/react';
import { InInstantEventMessageReply } from '@/models/instant_message/interface/in_instant_event_message';
import ExtraMenuIcon from '@/components/extra_menu_icon';
import { useAuth } from '@/contexts/auth_user.context';
import ChatClientService from '../chat.client.service';
import ColorPalette from '@/styles/color_palette';

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

interface Props {
  instantEventId: string;
  messageId: string;
  isOwner: boolean;
  replyItem: InInstantEventMessageReply;
  onSendComplete: () => void;
  // eslint-disable-next-line react/require-default-props
  fontSize?: string;
}

const InstantEventMessageReply = function ({
  replyItem,
  isOwner,
  instantEventId,
  messageId,
  onSendComplete,
  fontSize = 'xs',
}: Props) {
  const { authUser } = useAuth();
  const toast = useToast();
  const isDeny = replyItem.deny !== undefined && replyItem.deny;
  function denyReply() {
    if (authUser === null) {
      toast({
        title: '로그인이 필요합니다',
        position: 'top-right',
      });
      return;
    }
    ChatClientService.denyReply({
      instantEventId,
      messageId,
      replyId: replyItem.id,
      deny: replyItem.deny === undefined ? true : !replyItem.deny,
    }).then((resp) => {
      if (resp.status !== 200 && resp.error !== undefined) {
        toast({
          title: (resp.error.data as { message: string }).message,
          status: 'warning',
          position: 'top-right',
        });
        return;
      }
      onSendComplete();
    });
  }
  return (
    <Box display="flex" mt="2">
      <Box pt="2">
        <Avatar
          size="xs"
          src={replyItem.author ? replyItem.author.photoURL ?? '/profile_anonymous.png' : '/profile_anonymous.png'}
          mr="2"
        />
      </Box>
      <Box
        borderRadius="md"
        p="2"
        width="full"
        bg="gray.100"
        border={replyItem.author ? `2px solid ${ColorPalette.mint}` : ''}
      >
        {isOwner && (
          <div style={{ float: 'right' }}>
            <Menu>
              <MenuButton
                width="24px"
                height="24px"
                as={IconButton}
                aria-label="Options"
                icon={<ExtraMenuIcon />}
                borderRadius="full"
                variant="link"
                size="xs"
                _focus={{ boxShadow: 'none' }}
              />
              <MenuList>
                <MenuItem
                  bgColor="red.300"
                  textColor="white"
                  _hover={{ bg: 'red.500' }}
                  _focus={{ bg: 'red.500' }}
                  onClick={() => {
                    denyReply();
                  }}
                >
                  {isDeny ? 'Accept' : 'Deny'}
                </MenuItem>
              </MenuList>
            </Menu>
          </div>
        )}
        {replyItem.author && (
          <Text
            fontSize="xs"
            color="white"
            bgColor={ColorPalette.mint}
            display="inline-block"
            paddingX="2"
            borderRadius="base"
          >
            {replyItem.author.displayName}
          </Text>
        )}
        <Text whiteSpace="pre-line" fontSize={fontSize} color="black">
          {convertMarkdownBoldToJsx(convertMarkdownLinksToJsx(replyItem.reply))}
        </Text>
      </Box>
    </Box>
  );
};

export default InstantEventMessageReply;
