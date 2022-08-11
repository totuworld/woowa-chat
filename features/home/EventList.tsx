import { useState } from 'react';
import axios from 'axios';
import { useQuery } from 'react-query';
import { Box } from '@chakra-ui/react';
import { InInstantEvent } from '@/models/instant_message/interface/in_instant_event';
import EventListItem from './EventListItem';
import { useAuth } from '@/contexts/auth_user.context';

const EventList = function () {
  const { authUser } = useAuth();
  const [eventList, setEventList] = useState<InInstantEvent[]>([]);

  const queryKey = ['chatEventList_for_main'];

  useQuery(
    queryKey,
    // eslint-disable-next-line no-return-await
    async () => await axios.get<InInstantEvent[]>('/api/instant-event.list'),
    {
      enabled: authUser !== null,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        if (data.status === 200 && data.data) {
          const filterData = data.data.filter(
            (fv) => fv.closed === false && (fv.locked !== undefined ? fv.locked === false : true),
          );
          setEventList(filterData);
        }
      },
    },
  );

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
