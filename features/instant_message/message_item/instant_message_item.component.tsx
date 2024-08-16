import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  GridItem,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
  Text,
  Textarea,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { CloseIcon, CheckIcon } from '@chakra-ui/icons';
import { useState, useMemo } from 'react';
import { InInstantEventMessage } from '@/models/instant_message/interface/in_instant_event_message';
import { useAuth } from '@/contexts/auth_user.context';
import ExtraMenuIcon from '@/components/extra_menu_icon';
import InstantMessageItemReplyInput from './reply_input.component';
import InstantEventMessageReply from './reply.component';
import ChatClientService from '../chat.client.service';
import ReplyIcon from '@/components/reply_icon';
import { PRIVILEGE_NO } from '@/features/owner_member/model/in_owner_privilege';
import { REACTION_TYPE } from './reaction_type';
import IconUp from './icon_up';

interface Props {
  instantEventId: string;
  locked: boolean;
  eventState: 'none' | 'locked' | 'closed' | 'question' | 'reply' | 'pre' | 'showAll' | 'adminCheck';
  item: InInstantEventMessage;
  onSendComplete: () => void;
  // eslint-disable-next-line react/require-default-props
  onDeleteComplete?: () => void;
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

const InstantMessageItem = function ({
  instantEventId,
  item,
  onSendComplete,
  locked,
  eventState,
  onDeleteComplete,
}: Props) {
  const { authUser, isOwner, hasPrivilege } = useAuth();
  const toast = useToast();
  const [toggleReplyInput, setToggleReplyInput] = useState(false);
  const [sortWeight, setSortWeight] = useState<number | undefined>(item.sortWeight);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEditMode, setIsEditMode] = useState(false);
  const [message, updateMessage] = useState(item.message);
  const [isSendingVote, setSendingVote] = useState({
    LIKE: false,
    DOWN: false,
    CARE: false,
    HAHA: false,
    WOW: false,
    SAD: false,
    ANGRY: false,
  });

  const memoReaction = useMemo(() => {
    if (item.reaction === undefined) return new Map<REACTION_TYPE, number>();
    return item.reaction.reduce((acc: Map<REACTION_TYPE, number>, cur) => {
      if (acc.has(cur.type) === false) {
        acc.set(cur.type, 1);
        return acc;
      }
      acc.set(cur.type, acc.get(cur.type)! + 1);
      return acc;
    }, new Map<REACTION_TYPE, number>());
  }, [item.reaction]);

  function sendReaction(reaction: { isAdd: boolean; type: REACTION_TYPE }) {
    if (authUser === null) {
      toast({
        title: '로그인이 필요합니다',
        position: 'top-right',
      });
      return;
    }
    setSendingVote((prev) => ({ ...prev, [reaction.type]: true }));
    ChatClientService.reactionMessageInfo({
      instantEventId,
      messageId: item.id,
      reaction,
    })
      .then((resp) => {
        if (resp.status !== 200 && resp.error !== undefined) {
          toast({
            title: (resp.error.data as { message: string }).message,
            status: 'warning',
            position: 'top-right',
          });
          return;
        }
        onSendComplete();
      })
      .finally(() => {
        setSendingVote((prev) => ({ ...prev, [reaction.type]: false }));
      });
  }

  function turnOnEditer() {
    setIsEditMode(true);
    updateMessage(item.message);
  }
  function turnOffEditer() {
    setIsEditMode(false);
  }

  const isDeny = item.deny !== undefined && item.deny;
  const havePostReplyPrivilege = hasPrivilege(PRIVILEGE_NO.postReply);

  function denyMessage() {
    if (authUser === null) {
      toast({
        title: '로그인이 필요합니다',
        position: 'top-right',
      });
      return;
    }
    ChatClientService.denyMessage({
      instantEventId,
      messageId: item.id,
      deny: !isDeny,
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

  function deleteMessage() {
    if (authUser === null) {
      toast({
        title: '로그인이 필요합니다',
        position: 'top-right',
      });
      return;
    }
    ChatClientService.deleteMessage({
      instantEventId,
      messageId: item.id,
    }).then((resp) => {
      if (resp.status !== 200 && resp.error !== undefined) {
        toast({
          title: (resp.error.data as { message: string }).message,
          status: 'warning',
          position: 'top-right',
        });
        return;
      }
      onDeleteComplete && onDeleteComplete();
    });
  }

  function updateSortWeight() {
    if (authUser === null) {
      toast({
        title: '로그인이 필요합니다',
        position: 'top-right',
      });
      return;
    }
    if (sortWeight === undefined) {
      toast({
        title: '정렬 가중치를 입력하세요',
        position: 'top-right',
      });
      return;
    }
    ChatClientService.updateMessageSortWeight({
      instantEventId,
      messageId: item.id,
      sortWeight,
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
      onClose();
    });
  }

  function updateMessageToServer(msg: string) {
    if (authUser === null) {
      toast({
        title: '로그인이 필요합니다',
        position: 'top-right',
      });
      return;
    }
    ChatClientService.updateMessage({
      instantEventId,
      messageId: item.id,
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

  const ownerMenuList = useMemo(() => {
    const returnMenuList = [];
    if (hasPrivilege(PRIVILEGE_NO.denyMessage)) {
      returnMenuList.push(
        <MenuItem
          key="menu-item-deny-message"
          bgColor="red.300"
          textColor="white"
          _hover={{ bg: 'red.500' }}
          _focus={{ bg: 'red.500' }}
          onClick={() => {
            denyMessage();
          }}
        >
          {isDeny ? 'Accept' : 'Deny'}
        </MenuItem>,
      );
    }
    if (hasPrivilege(PRIVILEGE_NO.deleteMessage)) {
      returnMenuList.push(
        <MenuItem
          key="menu-item-deny-message"
          bgColor="red.300"
          textColor="white"
          _hover={{ bg: 'red.500' }}
          _focus={{ bg: 'red.500' }}
          onClick={() => {
            deleteMessage();
          }}
        >
          삭제
        </MenuItem>,
      );
    }
    if (hasPrivilege(PRIVILEGE_NO.chageSortWeitghtForMessage)) {
      returnMenuList.push(
        <MenuItem
          key="menu-item-weight-setting"
          onClick={() => {
            onOpen();
          }}
        >
          정렬 가중치 설정
        </MenuItem>,
      );
    }
    if (hasPrivilege(PRIVILEGE_NO.updateMessage)) {
      returnMenuList.push(
        <MenuItem
          key="menu-item-upate-message"
          onClick={() => {
            turnOnEditer();
          }}
        >
          본문 수정하기
        </MenuItem>,
      );
    }
    if (hasPrivilege(PRIVILEGE_NO.setPin)) {
      returnMenuList.push(
        <MenuItem
          key="menu-item-pin-message"
          onClick={() => {
            ChatClientService.pinMessage({
              instantEventId,
              messageId: item.id,
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
          }}
        >
          메시지 📌
        </MenuItem>,
      );
    }
    return returnMenuList;
  }, [authUser, isOwner]);

  const linkText = convertMarkdownLinksToJsx(item.message);
  const printMessage = convertMarkdownBoldToJsx(linkText);

  return (
    <Box borderRadius="md" width="full" bg="white" boxShadow="md">
      <Box>
        <Flex px="2" pt="2" alignItems="center">
          {item.pin !== undefined && item.pin === true && <Text fontSize="2xl">📌</Text>}
          <Spacer />
          {isOwner && (
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
              <MenuList>{ownerMenuList}</MenuList>
            </Menu>
          )}
        </Flex>
      </Box>
      {isOpen && (
        <Box p="2" display="flex">
          <Input
            mr="2"
            width="full"
            type="number"
            value={sortWeight}
            onChange={(e) => {
              if (e.target.value.length === 0) {
                setSortWeight(undefined);
                return;
              }
              setSortWeight(parseInt(e.target.value, 10));
            }}
            placeholder="정렬 가중치"
          />
          <Button disabled={sortWeight === undefined} onClick={() => updateSortWeight()} mr="2" colorScheme="blue">
            수정
          </Button>
          <Button
            onClick={() => {
              if (sortWeight !== item.sortWeight) {
                setSortWeight(item.sortWeight);
              }
              onClose();
            }}
          >
            닫기
          </Button>
        </Box>
      )}
      <Box p="2">
        <Box p="2">
          {isEditMode && (
            <Textarea
              bg="gray.100"
              border="none"
              boxShadow="none !important"
              placeholder="무엇이 궁금한가요?"
              borderRadius="md"
              fontSize="sm"
              mr="2"
              minHeight="400px"
              value={message}
              onChange={(e) => {
                updateMessage(e.target.value);
              }}
            />
          )}
          {isEditMode === false && (
            <Text whiteSpace="pre-line" fontSize="sm">
              {printMessage}
            </Text>
          )}
          {item.deny !== undefined && item.deny === true && <Badge colorScheme="red">비공개 처리된 메시지</Badge>}
        </Box>
        <Divider />
        {(item.deny === undefined || item.deny === false) && (
          <Flex
            minWidth="max-content"
            alignItems="center"
            justifyContent="center"
            gap={2}
            width="full"
            bg="white"
            bottom="0"
            zIndex="overlay"
            paddingX="2"
            paddingTop={2}
            borderColor="gray.300"
          >
            <GridItem key="grid-item-vote-up" flex={1}>
              <Button
                isLoading={isSendingVote.LIKE}
                disabled={isSendingVote.LIKE}
                fontSize="xs"
                width="full"
                leftIcon={<IconUp size={16} active={memoReaction.has('LIKE') === true} />}
                variant="ghost"
                height="4"
                _hover={{ bg: 'white' }}
                _focus={{ bg: 'white' }}
                onClick={() => {
                  if (eventState === 'reply' && memoReaction.has('LIKE') === true) {
                    sendReaction({
                      isAdd: false,
                      type: 'LIKE',
                    });
                  }
                  if (eventState === 'reply' && memoReaction.has('LIKE') === false) {
                    sendReaction({
                      isAdd: true,
                      type: 'LIKE',
                    });
                  }
                }}
              >
                공감해요 {isOwner || eventState === 'showAll' ? memoReaction.get('LIKE') : ''}
              </Button>
            </GridItem>
            {((isEditMode === false && eventState === 'reply') || havePostReplyPrivilege === true) && (
              <GridItem key="grid-item-reply" flex={1}>
                <Button
                  fontSize="xs"
                  leftIcon={<ReplyIcon />}
                  variant="ghost"
                  height="4"
                  color="black"
                  width="full"
                  _hover={{ bg: 'white' }}
                  _focus={{ bg: 'white' }}
                  onClick={() => {
                    setToggleReplyInput((prev) => !prev);
                  }}
                >
                  댓글달기
                </Button>
              </GridItem>
            )}
            {isEditMode === true && (
              <GridItem w="100%" key="grid-item-close">
                <Button
                  disabled={locked === true}
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
            )}
            {isEditMode === true && (
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
                    updateMessageToServer(message);
                  }}
                >
                  수정 반영하기
                </Button>
              </GridItem>
            )}
          </Flex>
        )}
        {toggleReplyInput && (
          <Box pt="2">
            <Divider />
            {(item.deny === undefined || item.deny === false) && (
              <InstantMessageItemReplyInput
                instantEventId={instantEventId}
                messageId={item.id}
                locked={false}
                onSendComplete={onSendComplete}
              />
            )}
          </Box>
        )}
        <Box>
          {item.reply &&
            item.reply.length > 0 &&
            item.reply
              .filter((replyItem) =>
                isOwner === true ? true : replyItem.deny === undefined || replyItem.deny === false,
              )
              .map((replyItem, idx) => (
                <Box pt="2" key={`instant-event-msg-reply-${instantEventId}-${item.id}-${replyItem.id}`}>
                  {idx === 0 && <Divider />}
                  <InstantEventMessageReply
                    // eslint-disable-next-line react/no-array-index-key
                    replyItem={replyItem}
                    instantEventId={instantEventId}
                    messageId={item.id}
                    isOwner={isOwner}
                    onSendComplete={onSendComplete}
                  />
                </Box>
              ))}
        </Box>
      </Box>
    </Box>
  );
};

export default InstantMessageItem;
