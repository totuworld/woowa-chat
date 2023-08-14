import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Grid,
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
import ResizeTextarea from 'react-textarea-autosize';
import { InInstantEventMessage } from '@/models/instant_message/interface/in_instant_event_message';
import { useAuth } from '@/contexts/auth_user.context';
import ExtraMenuIcon from '@/components/extra_menu_icon';
import InstantMessageItemReplyInput from './reply_input.component';
import InstantEventMessageReply from './reply.component';
import ChatClientService from '../chat.client.service';
import ReplyIcon from '@/components/reply_icon';
import { PRIVILEGE_NO } from '@/features/owner_member/model/in_owner_privilege';

interface Props {
  instantEventId: string;
  locked: boolean;
  item: InInstantEventMessage;
  onSendComplete: () => void;
}

const InstantMessageItem = function ({ instantEventId, item, onSendComplete, locked }: Props) {
  const { authUser, isOwner, hasPrivilege } = useAuth();
  const toast = useToast();
  const [toggleReplyInput, setToggleReplyInput] = useState(false);
  const [sortWeight, setSortWeight] = useState<number | undefined>(item.sortWeight);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEditMode, setIsEditMode] = useState(false);
  const [message, updateMessage] = useState(item.message);

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
    if (hasPrivilege(PRIVILEGE_NO.chageSortWeitghtForMessage)) {
      returnMenuList.push(
        <MenuItem
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
          onClick={() => {
            turnOnEditer();
          }}
        >
          본문 수정하기
        </MenuItem>,
      );
    }
    return returnMenuList;
  }, [authUser, isOwner]);

  return (
    <Box borderRadius="md" width="full" bg="white" boxShadow="md">
      <Box>
        <Flex px="2" pt="2" alignItems="center">
          <Avatar size="xs" src="/profile_anonymous.png" />
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
              resize="none"
              minH="unset"
              minRows={1}
              maxRows={7}
              overflow="hidden"
              fontSize="sm"
              mr="2"
              as={ResizeTextarea}
              value={message}
              onChange={(e) => {
                // 최대 7줄만 스크린샷에 표현되니 10줄 넘게 입력하면 제한걸어야한다.
                if (e.target.value) {
                  const lineCount = (e.target.value.match(/[^\n]*\n[^\n]*/gi)?.length ?? 1) + 1;
                  if (lineCount > 10) {
                    toast({
                      title: '최대 10줄까지만 입력가능합니다',
                      position: 'top-right',
                    });
                    return;
                  }
                }
                updateMessage(e.target.value);
              }}
            />
          )}
          {isEditMode === false && (
            <Text whiteSpace="pre-line" fontSize="sm">
              {item.message}
            </Text>
          )}
          {item.deny !== undefined && item.deny === true && <Badge colorScheme="red">비공개 처리된 메시지</Badge>}
        </Box>
        {havePostReplyPrivilege === true && <Divider />}
        {(item.deny === undefined || item.deny === false) && (
          <Grid
            templateColumns="repeat(2, 1fr)"
            gap={2}
            width="full"
            bg="white"
            bottom="0"
            zIndex="overlay"
            padding="2"
            borderColor="gray.300"
          >
            {isEditMode === false && havePostReplyPrivilege === true && (
              <GridItem w="100%">
                <Button
                  fontSize="xs"
                  leftIcon={<ReplyIcon />}
                  width="full"
                  variant="ghost"
                  height="4"
                  color="black"
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
              <GridItem w="100%">
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
              <GridItem w="100%">
                <Button
                  disabled={locked === true}
                  fontSize="xs"
                  leftIcon={<CheckIcon />}
                  width="full"
                  variant="ghost"
                  height="4"
                  colorScheme="messenger"
                  _hover={{ bg: 'white' }}
                  _focus={{ bg: 'white' }}
                  onClick={() => {
                    console.log(message);
                    updateMessageToServer(message);
                  }}
                >
                  수정 반영하기
                </Button>
              </GridItem>
            )}
          </Grid>
        )}
        {isOwner && toggleReplyInput && havePostReplyPrivilege === true && (
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
            item.reply.map((replyItem, idx) => (
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
