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
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import convertDateToString from '@/utils/convert_date_to_string';
import { InInstantEventMessage } from '@/models/instant_message/interface/in_instant_event_message';
import { useAuth } from '@/contexts/auth_user.context';
import ExtraMenuIcon from '@/components/extra_menu_icon';
import InstantMessageItemReplyInput from './reply_input.component';
import InstantEventMessageReply from './reply.component';
import ChatClientService from '../chat.client.service';
import ReplyIcon from '@/components/reply_icon';

import buildInStyles from './instant_message_temp.module.css';
import ReactionEmojiSelector from './reaction_emoji_selector';
import ReactionConst, { REACTION_TYPE } from './reaction_type';

const ReactionEmoji = styled.div<{ image: string }>`
  width: 16px;
  height: 16px;
  background-size: 100% 100%;
  border-radius: 8px;
  background-image: url(${({ image }) => image});
  box-shadow: 0 0 0 2px #fff;
  position: relative;
  z-index: 5;
`;

const REACTION_TYPE_COUNT = Object.values(ReactionConst.TYPE_TO_IMAGE).length;

const ReactionCounter = function ({ reaction }: { reaction: InInstantEventMessage['reaction'] }) {
  const memoReduceReaction = useMemo(() => {
    if (reaction === undefined) return [];
    return reaction.reduce((acc: REACTION_TYPE[], cur) => {
      const findIndex = acc.findIndex((fv) => fv === cur.type);
      if (findIndex === -1) {
        return [...acc, cur.type];
      }
      return acc;
    }, []);
  }, [reaction]);
  return (
    <div style={{ position: 'relative' }}>
      <div className={buildInStyles.counter}>
        {memoReduceReaction.map((emojiItem) => (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <ReactionEmoji image={ReactionConst.TYPE_TO_IMAGE[emojiItem]} />
        ))}
        {memoReduceReaction.length === 1 && (
          <p style={{ paddingLeft: '4px', color: '#000' }}>{ReactionConst.TYPE_TO_TITLE[memoReduceReaction[0]]}</p>
        )}
        {reaction !== undefined && reaction.length > REACTION_TYPE_COUNT && (
          <div style={{ paddingLeft: '4px' }}>외 {reaction.length - REACTION_TYPE_COUNT}</div>
        )}
      </div>
    </div>
  );
};

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
  const [showEmotionSelector, setEmotionSelector] = useState(false);

  useEffect(() => {
    setVoted(item.voted);
  }, [item]);

  function sendReaction(reaction: { isAdd: true; type: REACTION_TYPE } | { isAdd: false }) {
    if (authUser === null) {
      toast({
        title: '로그인이 필요합니다',
        position: 'top-right',
      });
      return;
    }
    setSendingVote(true);
    // setVoted((prev) => !prev);
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
        setSendingVote(false);
        setEmotionSelector(false);
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
        {showEmotionSelector && (
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '20%', bottom: '100%' }}>
              <ReactionEmojiSelector
                onClickReaction={(reactionType) => {
                  sendReaction({ isAdd: true, type: reactionType });
                }}
                showCount={locked}
                reaction={item.reaction}
              />
            </div>
          </div>
        )}
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
                disabled={isSendingVote}
                fontSize="xs"
                leftIcon={
                  item.reaction === undefined || item.reaction.length === 0 ? (
                    <ReactionEmoji image="/reaction_empty_thumb.png" />
                  ) : undefined
                }
                width="full"
                variant="ghost"
                height="4"
                color="black"
                _hover={{ bg: 'white' }}
                _focus={{ bg: 'white' }}
                onClick={() => {
                  if (locked) {
                    setEmotionSelector((prev) => !prev);
                    return;
                  }
                  // 이미 리액션을 등록한 상태라면 기존에 들어간 리액션을 제거.
                  if (voted) {
                    sendReaction({ isAdd: false });
                    return;
                  }
                  setEmotionSelector((prev) => !prev);
                }}
              >
                {(item.reaction === undefined || item.reaction.length === 0) && <Box>공감해요</Box>}
                <ReactionCounter reaction={item.reaction} />
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
