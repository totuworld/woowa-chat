import { Box } from '@chakra-ui/react';
import { InInstantEvent } from '@/models/instant_message/interface/in_instant_event';
import EventListItem from './EventListItem';

const EventList = function ({ eventList }: { eventList: InInstantEvent[] }) {
  return (
    <Box maxW="xl" mx="auto" minH="95vh" overflow="scroll; height:200px;">
      <Box spacing="12px" mt="6">
        {eventList.map((eventInfo) => (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <EventListItem key={`main_event_list_${eventInfo.instantEventId}`} {...eventInfo} />
        ))}
      </Box>
    </Box>
  );
};

export default EventList;
