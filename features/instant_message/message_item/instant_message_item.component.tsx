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
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import convertDateToString from '@/utils/convert_date_to_string';
import { InInstantEventMessage } from '@/models/instant_message/interface/in_instant_event_message';
import { useAuth } from '@/contexts/auth_user.context';
import ExtraMenuIcon from '@/components/extra_menu_icon';
import HeartIcon from '@/components/heart_icon';
import InstantMessageItemReplyInput from './reply_input.component';
import InstantEventMessageReply from './reply.component';
import ChatClientService from '../chat.client.service';
import HeartEmptyIcon from '@/components/heart_empty_icon';
import ReplyIcon from '@/components/reply_icon';

interface Props {
  instantEventId: string;
  locked: boolean;
  item: InInstantEventMessage;
  onSendComplete: () => void;
}

const InstantMessageItem = function ({ instantEventId, item, onSendComplete, locked }: Props) {
  const { authUser, isOwner } = useAuth();
  const toast = useToast();
  const [toggleReplyInput, setToggleReplyInput] = useState(false);
  const [sortWeight, setSortWeight] = useState<number | undefined>(item.sortWeight);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSendingVote, setSendingVote] = useState(false);
  const [voted, setVoted] = useState(item.voted);

  useEffect(() => {
    setVoted(item.voted);
  }, [item]);

  function sendVote(isUpvote: boolean) {
    if (authUser === null) {
      toast({
        title: '로그인이 필요합니다',
        position: 'top-right',
      });
      return;
    }
    setSendingVote(true);
    setVoted((prev) => !prev);
    ChatClientService.voteMessageInfo({
      instantEventId,
      messageId: item.id,
      isUpvote,
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
        setSendingVote(false);
      });
  }

  const isDeny = item.deny !== undefined && item.deny;

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

  return (
    <Box borderRadius="md" width="full" bg="white" boxShadow="md">
      <Box>
        <Flex px="2" pt="2" alignItems="center">
          <Avatar size="xs" src="/profile_anonymous.png" />
          <Text fontSize="xx-small" ml="1">
            anonymous
          </Text>
          <Text whiteSpace="pre-line" fontSize="xx-small" color="gray.500" ml="1">
            {convertDateToString(item.createAt)}
          </Text>
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
              <MenuList>
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
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    console.info('click');
                    onOpen();
                  }}
                >
                  정렬 가중치 변경
                </MenuItem>
              </MenuList>
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
          <Text whiteSpace="pre-line" fontSize="sm">
            {item.message}
          </Text>
          {item.deny !== undefined && item.deny === true && <Badge colorScheme="red">비공개 처리된 메시지</Badge>}
        </Box>
        <Divider />
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
            <GridItem w="100%">
              <Button
                isLoading={isSendingVote}
                disabled={locked === true || isSendingVote}
                fontSize="xs"
                leftIcon={voted ? <HeartIcon /> : <HeartEmptyIcon />}
                width="full"
                variant="ghost"
                height="4"
                color="black"
                _hover={{ bg: 'white' }}
                _focus={{ bg: 'white' }}
                onClick={() => {
                  sendVote(!voted);
                }}
              >
                {locked === true ? `${item.vote}` : '궁금해요'}
              </Button>
            </GridItem>
            <GridItem w="100%">
              <Button
                disabled={locked === true}
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
          </Grid>
        )}
        {locked === false && toggleReplyInput && (
          <Box pt="2">
            <Divider />
            {(item.deny === undefined || item.deny === false) && (
              <InstantMessageItemReplyInput
                instantEventId={instantEventId}
                messageId={item.id}
                locked={locked}
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
