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
import ChatClientService from '../chat.client.service';
import ColorPalette from '@/styles/color_palette';
import { PRIVILEGE_NO } from '@/features/owner_member/model/in_owner_privilege';

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

const InstantEventMessageReply = function ({
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
  function deleteReply() {
    if (authUser === null) {
      toast({
        title: '로그인이 필요합니다',
        position: 'top-right',
      });
      return;
    }
    ChatClientService.deleteReply({
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
    // updateMessage(item.message);
  }
  function turnOffEditer() {
    setIsEditMode(false);
  }

  const printReply = convertMarkdownBoldToJsx(convertMarkdownLinksToJsx(replyItem.reply));
  const hasUserInfo = replyItem.userName !== undefined && replyItem.email !== undefined;
  if (hasUserInfo) {
    // email의 @ 뒤에 글자를 모두 삭제한다
    const emailId = replyItem.email!.replace(/@.*/, '');
    printReply.push(
      <Text fontSize="xs" color="gray.500" key="reply-author" marginTop={2}>
        {replyItem.userName} (@{emailId})
      </Text>,
    );
  }

  const avatarPhotoUrl = (() => {
    if (replyItem.author) {
      return replyItem.author.photoURL ?? '/profile_anonymous.png';
    }
    if (hasUserInfo) {
      // replyItem.userName의 마지막 글자를 16진수로 변환한 뒤, 나머지 연산을 통해 0~4 사이의 숫자만 나오도록 한다.
      const userName = replyItem.userName!;
      const userNameLastCharCode = parseInt(userName.charCodeAt(userName.length - 1).toString(16), 16) % 5;
      const imgList = [
        '/profile_dokgo.png',
        '/profile_girl.png',
        '/profile_owner.png',
        '/profile_rider.png',
        '/profile_cs.png',
      ];
      return imgList[userNameLastCharCode];
    }
    return '/profile_anonymous.png';
  })();

  const memberMenuList = useMemo(() => {
    const returnMenuList = [];
    if (eventState === 'showAll' || eventState === 'locked' || eventState === 'closed') return [];
    if (authUser?.email === replyItem.email) {
      returnMenuList.push(
        <MenuItem
          key="menu-item-upate-message"
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

  function updateReplyToServer(msg: string) {
    if (authUser === null) {
      toast({
        title: '로그인이 필요합니다',
        position: 'top-right',
      });
      return;
    }
    ChatClientService.updateReply({
      instantEventId,
      messageId,
      replyId: replyItem.id,
      message: msg,
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

  return (
    <Box display="flex" mt="2">
      <Box pt="2">
        <Avatar size="xs" src={avatarPhotoUrl} mr="2" />
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
                {hasPrivilege(PRIVILEGE_NO.denyReply) && (
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
                )}
                {hasPrivilege(PRIVILEGE_NO.deleteReply) && (
                  <MenuItem
                    bgColor="red.300"
                    textColor="white"
                    _hover={{ bg: 'red.500' }}
                    _focus={{ bg: 'red.500' }}
                    onClick={() => {
                      deleteReply();
                    }}
                  >
                    댓글 삭제
                  </MenuItem>
                )}
                {hasPrivilege(PRIVILEGE_NO.updateMessage) && (
                  <MenuItem
                    onClick={() => {
                      turnOnEditer();
                    }}
                  >
                    댓글 수정하기
                  </MenuItem>
                )}
              </MenuList>
            </Menu>
          </div>
        )}
        {isOwner === false && memberMenuList.length > 0 && (
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
              <MenuList>{memberMenuList}</MenuList>
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
            marginBottom="2"
            borderRadius="base"
          >
            {replyItem.author.displayName}
          </Text>
        )}
        <Box>
          {isEditMode === true && (
            <>
              <Textarea
                bg="gray.100"
                border="none"
                boxShadow="none !important"
                placeholder="댓글을 입력하세요..."
                borderRadius="md"
                fontSize="sm"
                mr="2"
                minHeight="400px"
                value={message}
                onChange={(e) => {
                  updateMessage(e.target.value);
                }}
              />
              <Flex>
                <GridItem w="100%" key="grid-item-close">
                  <Button
                    fontSize="xs"
                    leftIcon={<CloseIcon />}
                    width="full"
                    variant="ghost"
                    height="4"
                    color="black"
                    _hover={{ bg: 'white' }}
                    _focus={{ bg: 'white' }}
                    onClick={() => {
                      turnOffEditer();
                    }}
                  >
                    닫기
                  </Button>
                </GridItem>
                <GridItem w="100%" key="grid-item-update-message">
                  <Button
                    disabled={eventState === 'closed'}
                    fontSize="xs"
                    leftIcon={<CheckIcon />}
                    width="full"
                    variant="ghost"
                    height="4"
                    colorScheme="messenger"
                    _hover={{ bg: 'white' }}
                    _focus={{ bg: 'white' }}
                    onClick={() => {
                      updateReplyToServer(message);
                    }}
                  >
                    수정 반영하기
                  </Button>
                </GridItem>
              </Flex>
            </>
          )}
          {isEditMode === false && (
            <Text whiteSpace="pre-line" fontSize={fontSize} color="black">
              {printReply}
            </Text>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default InstantEventMessageReply;
