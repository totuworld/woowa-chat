import {
  Avatar,
  Box,
  Button,
  Flex,
  GridItem,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { InInstantEventMessageReply } from '@/models/instant_message/interface/in_instant_event_message';
import ExtraMenuIcon from '@/components/extra_menu_icon';
import { useAuth } from '@/contexts/auth_user.context';
import TownhallClientService from '../townhall.client.service';
import ColorPalette from '@/styles/color_palette';
import { PRIVILEGE_NO } from '@/features/owner_member/model/in_owner_privilege';

// HTML 태그가 있는지 정규식으로 정확히 체크
const hasHtmlTags = (text: string): boolean => {
  // <태그> 또는 </태그> 형식을 찾는 정규식 패턴
  const htmlTagPattern = /<\/?[a-z][^>]*>/i;
  return htmlTagPattern.test(text);
};

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
  eventState: 'none' | 'locked' | 'closed' | 'question' | 'reply' | 'pre' | 'showAll' | 'adminCheck';
}

const TownhallEventMessageReply = function ({
  replyItem,
  isOwner,
  instantEventId,
  messageId,
  onSendComplete,
  fontSize = 'xs',
  eventState,
}: Props) {
  const { authUser, hasPrivilege } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [message, updateMessage] = useState(replyItem.reply);
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
    TownhallClientService.denyReply({
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
  
  function deleteReply() {
    if (authUser === null) {
      toast({
        title: '로그인이 필요합니다',
        position: 'top-right',
      });
      return;
    }
    TownhallClientService.deleteReply({
      instantEventId,
      messageId,
      replyId: replyItem.id,
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

  function turnOnEditer() {
    setIsEditMode(true);
    updateMessage(replyItem.reply);
  }
  
  function turnOffEditer() {
    setIsEditMode(false);
  }

  function updateReplyToServer(msg: string) {
    if (authUser === null) {
      toast({
        title: '로그인이 필요합니다',
        position: 'top-right',
      });
      return;
    }
    TownhallClientService.updateReply({
      instantEventId,
      messageId,
      replyId: replyItem.id,
      reply: msg,
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
      turnOffEditer();
    });
  }

  const ownerMenuList = useMemo(() => {
    const returnMenuList = [];
    if (hasPrivilege(PRIVILEGE_NO.denyReply)) {
      returnMenuList.push(
        <MenuItem
          key="menu-item-deny-reply"
          bgColor="red.300"
          textColor="white"
          _hover={{ bg: 'red.500' }}
          _focus={{ bg: 'red.500' }}
          onClick={() => {
            denyReply();
          }}
        >
          {isDeny ? 'Accept' : 'Deny'}
        </MenuItem>,
      );
    }
    if (hasPrivilege(PRIVILEGE_NO.deleteReply)) {
      returnMenuList.push(
        <MenuItem
          key="menu-item-delete-reply"
          bgColor="red.300"
          textColor="white"
          _hover={{ bg: 'red.500' }}
          _focus={{ bg: 'red.500' }}
          onClick={() => {
            deleteReply();
          }}
        >
          삭제
        </MenuItem>,
      );
    }
    if (hasPrivilege(PRIVILEGE_NO.updateReply)) {
      returnMenuList.push(
        <MenuItem
          key="menu-item-update-reply"
          onClick={() => {
            turnOnEditer();
          }}
        >
          댓글 수정하기
        </MenuItem>,
      );
    }
    return returnMenuList;
  }, [authUser, isOwner]);

  const memberMenuList = useMemo(() => {
    const returnMenuList = [];
    if (eventState === 'adminCheck' || eventState === 'locked' || eventState === 'showAll' || eventState === 'closed')
      return [];
    if (authUser?.email === replyItem.email) {
      returnMenuList.push(
        <MenuItem
          key="menu-item-update-reply"
          onClick={() => {
            turnOnEditer();
          }}
        >
          댓글 수정하기
        </MenuItem>,
      );
    }
    return returnMenuList;
  }, [authUser, replyItem]);

  // item.message 안에 html 요소가 있는지 체크해서 있으면 HTML로 렌더링, 아니라면 마크다운 변환
  const { messageContent, hasHtml } = useMemo(() => {
    if (hasHtmlTags(replyItem.reply)) {
      return {
        messageContent: replyItem.reply,
        hasHtml: true,
      };
    }
    const linkText = convertMarkdownLinksToJsx(replyItem.reply);
    return {
      messageContent: convertMarkdownBoldToJsx(linkText),
      hasHtml: false,
    };
  }, [replyItem.reply]);

  const avatarURL = useMemo(() => {
    if (replyItem.author !== undefined && replyItem.author.photoURL !== undefined) {
      return replyItem.author.photoURL;
    }
    return '/profile_anonymous.png';
  }, [replyItem.author]);

  const displayName = useMemo(() => {
    if (replyItem.author !== undefined && replyItem.author.displayName !== 'anonymous') {
      return replyItem.author.displayName;
    }
    return '';
  }, [replyItem.author]);

  return (
    <Box pl="6" pb="2">
      <Flex alignItems="flex-start">
        <Avatar
          size="xs"
          src={avatarURL}
          mr="2"
        />
        <Box bg="gray.100" borderRadius="md" pl="2" pr="2" pt="1" pb="1" width="full" fontSize={fontSize}>
          <Flex alignItems="center">
            {displayName !== '' && <Text fontSize={fontSize} fontWeight="semibold">{displayName}</Text>}
            <Box flex="1" />
            {isOwner && ownerMenuList.length > 0 && (
              <Menu>
                <MenuButton
                  width="16px"
                  height="16px"
                  as={IconButton}
                  aria-label="Options"
                  icon={<ExtraMenuIcon />}
                  borderRadius="full"
                  variant="link"
                  size="xs"
                  _focus={{ boxShadow: 'none' }}
                />
                <MenuList>{ownerMenuList}</MenuList>
              </Menu>
            )}
            {isOwner === false && memberMenuList.length > 0 && (
              <Menu>
                <MenuButton
                  width="16px"
                  height="16px"
                  as={IconButton}
                  aria-label="Options"
                  icon={<ExtraMenuIcon />}
                  borderRadius="full"
                  variant="link"
                  size="xs"
                  _focus={{ boxShadow: 'none' }}
                />
                <MenuList>{memberMenuList}</MenuList>
              </Menu>
            )}
          </Flex>
          {isEditMode && (
            <Box mb="2">
              <Textarea
                mt="2"
                fontSize={fontSize}
                bg="white"
                resize="none"
                value={message}
                onChange={(e) => {
                  updateMessage(e.currentTarget.value);
                }}
                placeholder="댓글을 입력하세요..."
                minH="unset"
                overflow="hidden"
                as="textarea"
                borderRadius="md"
                minRows={1}
                maxRows={15}
              />
            </Box>
          )}
          {isEditMode === false && (
            <>
              {hasHtml ? (
                <Box
                  className="html-content"
                  fontSize={fontSize}
                  sx={{
                    '& p': {
                      minHeight: '1.5em',
                      marginBottom: '0.5em',
                    },
                    '& p:empty': {
                      height: '1.5em',
                      display: 'block',
                    },
                    '& p:empty::after': {
                      content: '"\u00a0"',
                      visibility: 'hidden',
                    },
                  }}
                  dangerouslySetInnerHTML={{ __html: messageContent as string }}
                />
              ) : (
                <Text whiteSpace="pre-line" fontSize={fontSize}>
                  {messageContent}
                </Text>
              )}
            </>
          )}
          {isEditMode === true && (
            <Flex
              minWidth="max-content"
              alignItems="center"
              justifyContent="center"
              gap={2}
              width="full"
              bg="gray.100"
              bottom="0"
              zIndex="overlay"
              paddingTop={2}
              borderColor="gray.300"
            >
              <GridItem w="100%" key="grid-item-close">
                <Button
                  fontSize="xs"
                  leftIcon={<CloseIcon />}
                  width="full"
                  variant="ghost"
                  height="4"
                  color="black"
                  _hover={{ bg: 'gray.100' }}
                  _focus={{ bg: 'gray.100' }}
                  onClick={() => {
                    turnOffEditer();
                  }}
                >
                  닫기
                </Button>
              </GridItem>
              <GridItem w="100%" key="grid-item-update-reply">
                <Button
                  disabled={eventState === 'closed'}
                  fontSize="xs"
                  leftIcon={<CheckIcon />}
                  width="full"
                  variant="ghost"
                  height="4"
                  colorScheme="messenger"
                  _hover={{ bg: 'gray.100' }}
                  _focus={{ bg: 'gray.100' }}
                  onClick={() => {
                    updateReplyToServer(message);
                  }}
                >
                  수정 반영하기
                </Button>
              </GridItem>
            </Flex>
          )}
          {replyItem.deny !== undefined && replyItem.deny === true && (
            <Text fontSize="xs" fontWeight="bold" color="red">
              비공개 처리된 댓글
            </Text>
          )}
        </Box>
      </Flex>
    </Box>
  );
};

export default TownhallEventMessageReply;
