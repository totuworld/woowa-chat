import { Menu, MenuButton, MenuList, IconButton, MenuItem } from '@chakra-ui/react';
import ExtraMenuIcon from '@/components/extra_menu_icon';
import { InInstantEvent } from '@/models/instant_message/interface/in_instant_event';
import ChatClientService from '../chat.client.service';

interface Props {
  eventState: 'none' | 'locked' | 'closed' | 'question' | 'reply' | 'pre';
  instantEventInfo: InInstantEvent;
  onCompleteLockOrClose: () => void;
}

async function immediateCloseSendMessagePeriod({ instantEventId }: { instantEventId: string }) {
  try {
    await ChatClientService.immediateClosSendMessagePeriod({
      instantEventId,
    });
    return {
      result: true,
    };
  } catch (err) {
    console.error(err);
    return {
      result: false,
      message: '질문기간 종료 실패',
    };
  }
}

async function lockEvent({ instantEventId }: { instantEventId: string }) {
  try {
    await ChatClientService.lock({
      instantEventId,
    });
    return {
      result: true,
    };
  } catch (err) {
    console.error(err);
    return {
      result: false,
      message: '이벤트 잠금 실패',
    };
  }
}

async function closeEvent({ instantEventId }: { instantEventId: string }) {
  try {
    await ChatClientService.close({
      instantEventId,
    });
    return {
      result: true,
    };
  } catch (err) {
    console.error(err);
    return {
      result: false,
      message: '이벤트 종료 실패',
    };
  }
}

const InstantEventHeaderSideMenu = function ({ eventState, instantEventInfo, onCompleteLockOrClose }: Props) {
  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="Options"
        icon={<ExtraMenuIcon />}
        borderRadius="full"
        variant="solid"
        size="xs"
        _focus={{ boxShadow: 'none' }}
      />
      <MenuList>
        {eventState === 'question' && (
          <MenuItem
            onClick={() => {
              immediateCloseSendMessagePeriod({
                instantEventId: instantEventInfo.instantEventId,
              })
                .then(() => {
                  onCompleteLockOrClose();
                })
                .catch((err) => {
                  console.error(err);
                });
            }}
          >
            질문기간 종료
          </MenuItem>
        )}
        {eventState === 'reply' && (
          <MenuItem
            onClick={() => {
              lockEvent({ instantEventId: instantEventInfo.instantEventId })
                .then(() => {
                  onCompleteLockOrClose();
                })
                .catch((err) => {
                  console.error(err);
                });
            }}
          >
            댓글잠금
          </MenuItem>
        )}
        <MenuItem
          bgColor="red.300"
          textColor="white"
          _hover={{ bg: 'red.500' }}
          _focus={{ bg: 'red.500' }}
          onClick={() => {
            closeEvent({ instantEventId: instantEventInfo.instantEventId })
              .then(() => {
                onCompleteLockOrClose();
              })
              .catch((err) => {
                console.error(err);
              });
          }}
        >
          이벤트 종료
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default InstantEventHeaderSideMenu;
