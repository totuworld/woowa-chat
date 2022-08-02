import { Box, Flex, Spinner, VStack } from '@chakra-ui/react';
import { InInstantEvent } from '@/models/instant_message/interface/in_instant_event';
import { InInstantEventMessage } from '@/models/instant_message/interface/in_instant_event_message';
import ChatClientService from './chat.client.service';
import InstantEventUtil from './instant_event.util';
import InstantMessageItem from './message_item/instant_message_item.component';
import { useAuth } from '@/contexts/auth_user.context';

const MessageList = function ({
  eventInfo,
  messageList,
  messageLoadingStatus,
  onSendComplete,
}: {
  eventInfo: InInstantEvent;
  messageList: InInstantEventMessage[];
  messageLoadingStatus: 'idle' | 'loading' | 'success' | 'error';
  onSendComplete: (data: InInstantEventMessage) => void;
}) {
  const { isOwner } = useAuth();
  const eventState = InstantEventUtil.calEventState(eventInfo);

  if (!(messageLoadingStatus === 'success' || messageLoadingStatus === 'error')) {
    return (
      <Flex alignContent="center" justifyContent="center" paddingTop="100">
        <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
      </Flex>
    );
  }
  return (
    <>
      {(eventState === 'reply' || eventState === 'locked' || isOwner) && messageList.length === 0 && (
        <Box mt="6">
          <img style={{ width: '50%', margin: '0 auto' }} src="/sorry@2x.png" alt="목록 없음" />
          <Flex justify="center">
            <Box mb="6" height="100vh" fontSize="sm">
              등록된 메시지가 없어요
            </Box>
          </Flex>
        </Box>
      )}
      {(eventState === 'reply' || eventState === 'locked' || isOwner) && (
        <VStack spacing="12px" mt="6">
          {messageList.map((item) => (
            <InstantMessageItem
              key={`instant-message-${eventInfo.instantEventId}-${item.id}`}
              instantEventId={eventInfo.instantEventId}
              item={item}
              locked={eventState === 'locked'}
              onSendComplete={() => {
                ChatClientService.getMessageInfo({
                  instantEventId: eventInfo.instantEventId,
                  messageId: item.id,
                }).then((info) => {
                  if (info.payload === undefined) {
                    return;
                  }
                  onSendComplete(info.payload!);
                });
              }}
            />
          ))}
        </VStack>
      )}
    </>
  );
};

export default MessageList;
