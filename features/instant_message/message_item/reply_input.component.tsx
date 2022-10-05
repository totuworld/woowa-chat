import { Avatar, Box, Button, Input, Textarea, useToast } from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import ResizeTextarea from 'react-textarea-autosize';
import ChatClientService from '../chat.client.service';
import ColorPalette from '@/styles/color_palette';

import './reply_input.module.css';
import { useAuth } from '@/contexts/auth_user.context';
import ProfileSelector from './profile_selector';

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

const InstantMessageItemReplyInput = function ({ locked, instantEventId, messageId, onSendComplete }: Props) {
  const toast = useToast();
  const { isOwner } = useAuth();
  const [message, updateMessage] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorProfileType, setAuthorProfileType] = useState<'SELECTED' | 'UPLOADED'>('SELECTED');
  const [authorProfileUrl, setAuthorProfileUrl] = useState<string | null>(null);
  const [authorProfileUploadImage, setAuthorProfileUploadImage] = useState('');
  const [isSending, setSending] = useState(false);
  const [toggleEditAuth, setToggleEditAuth] = useState(false);
  return (
    <Box>
      <Box display="flex" mt="2">
        <Box pt="1">
          <Avatar size="xs" src="/profile_anonymous.png" mr="2" />
        </Box>
        <Box borderRadius="md" width="full" bg="gray.100" mr="2">
          <Textarea
            disabled={locked}
            border="none"
            boxShadow="none !important"
            resize="none"
            minH="unset"
            minRows={1}
            overflow="hidden"
            fontSize="xs"
            as={ResizeTextarea}
            placeholder="댓글을 입력하세요..."
            value={message}
            onChange={(e) => {
              updateMessage(e.target.value);
            }}
          />
        </Box>
        <Button
          isLoading={isSending}
          disabled={isSending || locked === true}
          textColor="white"
          bgColor={`${ColorPalette.red}`}
          _hover={{ bg: ColorPalette.red_disabled }}
          variant="solid"
          size="sm"
          // borderRadius="full"
          onClick={async () => {
            if (message.trim().length <= 0) {
              toast({
                title: '공백을 제외하고 최소 1자 이상의 글자를 입력해주세요',
                position: 'top-right',
                status: 'warning',
              });
              return;
            }
            if (message.trim().length > 1000) {
              toast({
                title: '1000자 내로 입력해주세요',
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
            if (isOwner && toggleEditAuth) {
              if (postData.author === undefined) {
                postData.author = {
                  displayName: 'anonymous',
                };
              }
              // 이미지인경우 업로드 처리가 필요함.
              if (authorProfileType === 'UPLOADED') {
                try {
                  const imageResp = await fetch('/api/image.add', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ image: authorProfileUploadImage }),
                  });
                  const imageRespData = await imageResp.json();
                  postData.author.photoURL = imageRespData.secure_url;
                } catch (err) {
                  console.error(err);
                }
              }
              if (authorProfileType === 'SELECTED' && authorProfileUrl !== null && authorProfileUrl.length >= 2) {
                postData.author.photoURL = authorProfileUrl;
              }
            }
            ChatClientService.postReply(postData)
              .then(() => {
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
              <p>프로필 선택</p>
              <ProfileSelector
                selectedProfile={authorProfileUrl}
                onSelectedProfile={({ type, url: profileUrl }: { type: 'SELECTED' | 'UPLOADED'; url: string }) => {
                  setAuthorProfileType(type);
                  if (type === 'UPLOADED') {
                    setAuthorProfileUploadImage(profileUrl);
                    return;
                  }
                  setAuthorProfileUrl(profileUrl);
                }}
              />
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

export default InstantMessageItemReplyInput;
