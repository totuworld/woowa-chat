import { Avatar, Box, Button, Textarea } from '@chakra-ui/react';
import { useState } from 'react';
import ResizeTextarea from 'react-textarea-autosize';
import ChatClientService from '../chat.client.service';
import ColorPalette from '@/styles/color_palette';

import './reply_input.module.css';

interface Props {
  instantEventId: string;
  messageId: string;
  locked: boolean;
  onSendComplete: () => void;
}

const InstantMessageItemReplyInput = function ({ locked, instantEventId, messageId, onSendComplete }: Props) {
  const [message, updateMessage] = useState('');
  const [isSending, setSending] = useState(false);
  return (
    <Box display="flex" mt="2">
      <Box pt="1">
        <Avatar size="xs" src="https://bit.ly/broken-link" mr="2" />
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
        disabled={isSending || message.length === 0 || locked === true}
        textColor="white"
        bgColor={`${ColorPalette.red}`}
        _hover={{ bg: ColorPalette.red_disabled }}
        variant="solid"
        size="sm"
        // borderRadius="full"
        onClick={() => {
          setSending(true);
          ChatClientService.postReply({
            instantEventId,
            messageId,
            reply: message,
          })
            .then(() => {
              updateMessage('');
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
  );
};

export default InstantMessageItemReplyInput;
