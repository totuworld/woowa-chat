import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Checkbox,
  Stack,
  useToast,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { InOwnerMember } from '@/features/owner_member/model/in_owner_member';
import { PRIVILEGE_NO, PRIVILEGE_NAME_AND_NO } from '@/features/owner_member/model/in_owner_privilege';
import { Entries } from '@/utils/type_guard';
import { useAuth } from '@/contexts/auth_user.context';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetUser: InOwnerMember | null;
  handleOnCompleteConfirm?: () => void;
}

const OwnerMemberRoleControl = function ({ isOpen, onClose, targetUser, handleOnCompleteConfirm }: Props) {
  const cancelRef = useRef<any>();
  const { token } = useAuth();
  const [privilege, setPrivilege] = useState<number[]>(targetUser !== null ? targetUser.privilege : []);
  const toast = useToast();

  function onSubmit() {
    fetch('/api/owner-member.update.privilege', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        authorization: token ?? '',
      },
      body: JSON.stringify({ uid: targetUser?.uid, privilege }),
    })
      .then((res) => {
        console.info(res);
        handleOnCompleteConfirm && handleOnCompleteConfirm();
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: '권한 변경에 실패했습니다',
          position: 'top-right',
          status: 'warning',
        });
      });
  }

  const checkBoxList = (Object.entries(PRIVILEGE_NO) as Entries<typeof PRIVILEGE_NO>).map(([key, value]) => {
    const checked = privilege.includes(value);
    return (
      <Checkbox
        key={`a-${key}`}
        value={value}
        defaultChecked={checked}
        onChange={(e) => {
          setPrivilege((prev) => {
            if (e.target.checked) {
              return [...prev, value];
            }
            return prev.filter((v) => v !== value);
          });
        }}
      >
        {PRIVILEGE_NAME_AND_NO[key].name}
      </Checkbox>
    );
  });
  useEffect(() => {
    if (isOpen === true && targetUser !== null && targetUser.privilege !== undefined) {
      setPrivilege(targetUser.privilege);
    }
  }, [targetUser, isOpen]);
  const displayName = targetUser !== null ? targetUser.displayName : '';
  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {displayName} 관리자 권한 제어
          </AlertDialogHeader>

          <AlertDialogBody>
            <Stack spacing={[1, 5]} direction={['column']}>
              {checkBoxList}
            </Stack>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              취소
            </Button>
            <Button
              colorScheme="red"
              onClick={() => {
                onSubmit();
              }}
              ml={3}
            >
              반영
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default OwnerMemberRoleControl;
