import { Box, Flex, Spinner, VStack } from '@chakra-ui/react';
import { InInstantEvent } from '@/models/instant_message/interface/in_instant_event';
import { InInstantEventMessage } from '@/models/instant_message/interface/in_instant_event_message';
import TownhallClientService from './townhall.client.service';
import TownhallMessageItem from './message_item/message_item.component';
import { useAuth } from '@/contexts/auth_user.context';
import TownhallUtil from './townhall.util';

const TownhallMessageList = function ({
  eventInfo,
  messageList,
  messageLoadingStatus,
  onSendComplete,
  onDeleteComplete,
}: {
  eventInfo: InInstantEvent;
  messageList: InInstantEventMessage[];
  messageLoadingStatus: 'idle' | 'loading' | 'success' | 'error';
  onSendComplete: (data: InInstantEventMessage) => void;
  // eslint-disable-next-line react/require-default-props
  onDeleteComplete?: () => void;
}) {
  const { isOwner } = useAuth();
  const eventState = TownhallUtil.calEventState(eventInfo);

  if (isOwner === false && !(messageLoadingStatus === 'success' || messageLoadingStatus === 'error')) {
    return <div> </div>;
  }

  if (!(messageLoadingStatus === 'success' || messageLoadingStatus === 'error')) {
    return (
      <Flex alignContent="center" justifyContent="center" paddingTop="100">
        <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
      </Flex>
    );
  }
  return (
    <>
      {messageList.length === 0 && (
        <Box mt="6">
          <img style={{ width: '50%', margin: '0 auto' }} src="/none_message.png" alt="목록 없음" />
          <Flex justify="center">
            <Box mb="6" height="100vh" fontSize="sm">
              등록된 메시지가 없어요
            </Box>
          </Flex>
        </Box>
      )}
      <VStack spacing="12px" mt="6" pb="10">
        {messageList.map((item) => (
          <TownhallMessageItem
            key={`townhall-message-${eventInfo.instantEventId}-${item.id}`}
            instantEventId={eventInfo.instantEventId}
            item={item}
            locked={eventState === 'locked' || eventState === 'showAll'}
            eventState={eventState}
            isQnA={eventInfo.isQnA}
            onSendComplete={() => {
              TownhallClientService.getMessageInfo({
                instantEventId: eventInfo.instantEventId,
                messageId: item.id,
              }).then((info) => {
                if (info.payload === undefined) {
                  return;
                }
                onSendComplete(info.payload!);
              });
            }}
            onDeleteComplete={onDeleteComplete}
          />
        ))}
      </VStack>
    </>
  );
};

export default TownhallMessageList;
