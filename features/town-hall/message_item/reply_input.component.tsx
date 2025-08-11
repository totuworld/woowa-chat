import { Avatar, Box, Button, Input, useToast } from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import TownhallClientService from '../townhall.client.service';
import ColorPalette from '@/styles/color_palette';
import TiptapEditor from '@/components/TiptapEditor';
import { useAuth } from '@/contexts/auth_user.context';

interface PostReplyData {
  instantEventId: string;
  messageId: string;
  reply: string;
  author?: {
    displayName: string;
    photoURL?: string;
  };
}

interface Props {
  instantEventId: string;
  messageId: string;
  locked: boolean;
  onSendComplete: () => void;
}

const TownhallMessageItemReplyInput = function ({ locked, instantEventId, messageId, onSendComplete }: Props) {
  const toast = useToast();
  const { isOwner } = useAuth();
  const [message, updateMessage] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isSending, setSending] = useState(false);
  const [toggleEditAuth, setToggleEditAuth] = useState(false);

  return (
    <Box>
      <Box display="flex" mt="2">
        <Box pt="1">
          <Avatar size="xs" src="/profile_anonymous.png" mr="2" />
        </Box>
        <Box borderRadius="md" width="full" bg="gray.100" mr="2">
          <TiptapEditor
            value={message}
            onChange={updateMessage}
            placeholder="댓글을 입력하세요..."
            minHeight="3.5rem"
          />
        </Box>
        <Button
          isLoading={isSending}
          disabled={isSending || locked === true}
          bgColor={`${ColorPalette.mint}`}
          textColor="white"
          _hover={{ bg: ColorPalette.mint_disabled }}
          variant="solid"
          size="sm"
          onClick={async () => {
            if (message.trim().length <= 0) {
              toast({
                title: '공백을 제외하고 최소 1자 이상의 글자를 입력해주세요',
                position: 'top-right',
                status: 'warning',
              });
              return;
            }
            if (message.trim().length > 5000) {
              toast({
                title: '5000자 내로 입력해주세요',
                position: 'top-right',
                status: 'warning',
              });
              return;
            }
            setSending(true);
            const postData: PostReplyData = {
              instantEventId,
              messageId,
              reply: message.trim(),
            };
            if (isOwner && toggleEditAuth && authorName.length >= 2) {
              postData.author = {
                displayName: authorName,
              };
            }
            TownhallClientService.postReply(postData)
              .then((resp) => {
                if (resp === undefined) {
                  toast({
                    title: '댓글 등록에 실패했습니다.',
                    status: 'warning',
                    position: 'top-right',
                  });
                  return;
                }
                if (resp.status !== 200) {
                  toast({
                    title:
                      resp.error === undefined
                        ? '댓글 등록에 실패했습니다.'
                        : (resp.error.data as { message: string }).message,
                    status: 'warning',
                    position: 'top-right',
                  });
                  return;
                }
                updateMessage('');
                toast({
                  title: '댓글 등록이 완료 되었습니다',
                  position: 'top-right',
                });
                onSendComplete();
              })
              .finally(() => {
                setSending(false);
              });
          }}
        >
          등록
        </Button>
      </Box>
      {isOwner && (
        <Box pt="2" pb="2">
          {!toggleEditAuth && (
            <Button
              width="full"
              size="xs"
              variant="ghost"
              rightIcon={<ChevronDownIcon />}
              onClick={() => {
                setToggleEditAuth(true);
              }}
            >
              댓글 작성자 수정 메뉴 펼치기
            </Button>
          )}
          {toggleEditAuth && (
            <>
              <p>작성자 이름 입력</p>
              <Input
                boxShadow="none !important"
                fontSize="xs"
                minH="unset"
                placeholder="작성자 이름"
                value={authorName}
                onChange={(e) => {
                  setAuthorName(e.currentTarget.value);
                }}
              />
              <Button
                width="full"
                size="xs"
                variant="ghost"
                rightIcon={<ChevronUpIcon />}
                onClick={() => {
                  setToggleEditAuth(false);
                }}
              >
                댓글 작성자 수정 메뉴 접기
              </Button>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default TownhallMessageItemReplyInput;
