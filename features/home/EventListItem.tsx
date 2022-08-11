import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Badge, Button, Flex, Spacer, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { InInstantEvent } from '@/models/instant_message/interface/in_instant_event';
import InstantEventUtil from '../instant_message/instant_event.util';

const EventListItem = function (eventInfo: InInstantEvent) {
  const router = useRouter();
  const eventState = InstantEventUtil.calEventState(eventInfo);
  const badgeColor = (() => {
    if (eventState === 'closed' || eventState === 'locked') return 'red';
    if (eventState === 'question' || eventState === 'reply') return 'green';
    return 'gray';
  })();
  const { title, instantEventId } = eventInfo;
  return (
    <Flex bg="white" p="2" alignItems="center" borderRadius="md" mb="2">
      <Badge colorScheme={badgeColor}>{InstantEventUtil.EventStateTOKorText[eventState]}</Badge>
      <Text style={{ marginLeft: '10px' }}>{title}</Text>
      <Spacer />
      <Button
        size="xs"
        style={{ marginRight: '10px' }}
        rightIcon={<ExternalLinkIcon />}
        onClick={() => {
          router.push(`/list/${instantEventId}`);
        }}
      >
        이동
      </Button>
    </Flex>
  );
};

export default EventListItem;
