import {
  Avatar,
  Box,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
  Text,
  useToast,
} from '@chakra-ui/react';
import { InInstantEventMessageReply } from '@/models/instant_message/interface/in_instant_event_message';
import convertDateToString from '@/utils/convert_date_to_string';
import ExtraMenuIcon from '@/components/extra_menu_icon';
import { useAuth } from '@/contexts/auth_user.context';
import ChatClientService from '../chat.client.service';

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
          src={
            replyItem.author ? replyItem.author.photoURL ?? 'https://bit.ly/broken-link' : 'https://bit.ly/broken-link'
          }
          mr="2"
        />
      </Box>
      <Box borderRadius="md" p="2" width="full" bg="gray.100">
        <Flex alignItems="center">
          <Text fontSize="xs">{replyItem.author ? replyItem.author.displayName : 'anonymous'}</Text>
          <Text whiteSpace="pre-line" fontSize="xs" color="gray">
            {convertDateToString(replyItem.createAt)}
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
                    denyReply();
                  }}
                >
                  {isDeny ? 'Accept' : 'Deny'}
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </Flex>
        <Text whiteSpace="pre-line" fontSize="xs">
          {replyItem.reply}
        </Text>
      </Box>
    </Box>
  );
};

export default InstantEventMessageReply;
