import { Box, Button } from '@chakra-ui/react';
import { TriangleDownIcon } from '@chakra-ui/icons';
import { InInstantEvent } from '@/models/instant_message/interface/in_instant_event';
import EventListItem from './EventListItem';

const EventListWithPage = function ({
  pages,
  showMoreBtn,
  onClickShowMore,
}: {
  pages: {
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
    content: InInstantEvent[];
  }[];
  showMoreBtn: boolean | undefined;
  onClickShowMore: (() => void) | undefined;
}) {
  return (
    <Box maxW="xl" mx="auto" minH="95vh" overflow="scroll; height:200px;">
      <Box spacing="12px" mt="6">
        {pages.map((currentPage) =>
          currentPage.content.map((eventInfo) => (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <EventListItem key={`main_event_list_admin_${eventInfo.instantEventId}`} {...eventInfo} />
          )),
        )}
        {showMoreBtn && (
          <Button
            width="full"
            mt="2"
            leftIcon={<TriangleDownIcon />}
            fontSize="sm"
            onClick={() => {
              if (onClickShowMore !== undefined && onClickShowMore !== null) onClickShowMore();
            }}
          >
            더보기
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default EventListWithPage;
