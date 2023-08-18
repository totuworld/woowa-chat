import { Avatar, Box, IconButton, Menu, MenuButton, MenuItem, MenuList, Text, useToast } from '@chakra-ui/react';
import { InInstantEventMessageReply } from '@/models/instant_message/interface/in_instant_event_message';
import ExtraMenuIcon from '@/components/extra_menu_icon';
import { useAuth } from '@/contexts/auth_user.context';
import ChatClientService from '../chat.client.service';
import ColorPalette from '@/styles/color_palette';

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

interface Props {
  instantEventId: string;
  messageId: string;
  isOwner: boolean;
  replyItem: InInstantEventMessageReply;
  onSendComplete: () => void;
}

const InstantEventMessageReply = function ({ replyItem, isOwner, instantEventId, messageId, onSendComplete }: Props) {
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
      <Box borderRadius="md" p="2" width="full" bg={replyItem.author ? ColorPalette.mint : 'gray.100'}>
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
            color={ColorPalette.mint}
            bgColor="white"
            display="inline-block"
            paddingX="2"
            borderRadius="base"
          >
            {replyItem.author.displayName}
          </Text>
        )}
        <Text whiteSpace="pre-line" fontSize="xs" color={replyItem.author ? 'white' : 'black'}>
          {convertMarkdownLinksToJsx(replyItem.reply)}
        </Text>
      </Box>
    </Box>
  );
};

export default InstantEventMessageReply;
