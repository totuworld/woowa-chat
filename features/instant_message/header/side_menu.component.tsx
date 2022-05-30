import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  IconButton,
  MenuItem,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { useRef } from 'react';
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

async function reopenEvent({ instantEventId }: { instantEventId: string }) {
  try {
    await ChatClientService.reopen({
      instantEventId,
    });
    return {
      result: true,
    };
  } catch (err) {
    console.error(err);
    return {
      result: false,
      message: '이벤트 재개 실패',
    };
  }
}

const InstantEventHeaderSideMenu = function ({ eventState, instantEventInfo, onCompleteLockOrClose }: Props) {
  const cancelRef = useRef<any>();
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
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
            display={instantEventInfo.closed ? 'none' : ''}
            bgColor="red.300"
            textColor="white"
            _hover={{ bg: 'red.500' }}
            _focus={{ bg: 'red.500' }}
            onClick={() => {
              onOpen();
            }}
          >
            이벤트 종료
          </MenuItem>
          <MenuItem
            display={instantEventInfo.closed ? '' : 'none'}
            onClick={() => {
              reopenEvent({ instantEventId: instantEventInfo.instantEventId })
                .then(() => {
                  onCompleteLockOrClose();
                })
                .catch((err) => {
                  console.error(err);
                });
            }}
          >
            이벤트 재개
          </MenuItem>
        </MenuList>
      </Menu>
      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              이벤트 종료
            </AlertDialogHeader>

            <AlertDialogBody>이 이벤트를 종료할까요?</AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                취소
              </Button>
              <Button
                colorScheme="blue"
                ml={3}
                onClick={() => {
                  closeEvent({ instantEventId: instantEventInfo.instantEventId })
                    .then(() => {
                      onCompleteLockOrClose();
                    })
                    .catch((err) => {
                      console.error(err);
                    })
                    .finally(() => {
                      onClose();
                    });
                }}
              >
                종료
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default InstantEventHeaderSideMenu;
