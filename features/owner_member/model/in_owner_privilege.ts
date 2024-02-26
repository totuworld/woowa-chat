export const PRIVILEGE_NO = {
  /** 메시지 deny 권한 */
  denyMessage: 101,
  /** 메시지 정렬 변경 권한 */
  chageSortWeitghtForMessage: 102,
  /** 메시지 수정 권한 */
  updateMessage: 103,
  /** 댓글 deny 권한 */
  denyReply: 201,
  /** 댓글 작성 권한 */
  postReply: 202,
  /** pin 조작 권한 */
  setPin: 203,
  /** 댓글 삭제 권한 */
  deleteReply: 204,
  /** 관리자 추가/삭제 권한 */
  addOrRemoveAdmin: 901,
  /** 관리자 역할 추가/삭제 권한 */
  addOrRemoveRole: 902,
};
type PrivilegeKeys = keyof typeof PRIVILEGE_NO;

// PRIVILEGE_NAME_AND_NO key가 PRIVILEGE_NO의 key와 같다는 것을 보장하기 위해 타입
export const PRIVILEGE_NAME_AND_NO: { [key in PrivilegeKeys]: { name: string; no: number } } = {
  /** 메시지 deny 권한 */
  denyMessage: { name: '메시지 deny 권한', no: PRIVILEGE_NO.denyMessage },
  /** 메시지 정렬 변경 권한 */
  chageSortWeitghtForMessage: { name: '메시지 정렬 변경 권한', no: PRIVILEGE_NO.chageSortWeitghtForMessage },
  /** 메시지 수정 권한 */
  updateMessage: { name: '메시지 수정 권한', no: PRIVILEGE_NO.updateMessage },
  /** 댓글 deny 권한 */
  denyReply: { name: '댓글 deny 권한', no: PRIVILEGE_NO.denyReply },
  /** 댓글 작성 권한 */
  postReply: { name: '댓글 작성 권한', no: PRIVILEGE_NO.postReply },
  setPin: { name: '메시지 pin 권한', no: PRIVILEGE_NO.setPin },
  deleteReply: { name: '댓글 삭제 권한', no: PRIVILEGE_NO.deleteReply },
  /** 관리자 추가/삭제 권한 */
  addOrRemoveAdmin: { name: '관리자 추가/삭제 권한', no: PRIVILEGE_NO.addOrRemoveAdmin },
  /** 관리자 역할 추가/삭제 권한 */
  addOrRemoveRole: { name: '관리자 권한 추가/삭제 권한', no: PRIVILEGE_NO.addOrRemoveRole },
};
interface MapItem {
  name: string;
  no: number;
}
export const PRIVILEGE_MAP = new Map<string, MapItem>();
PRIVILEGE_MAP.set(PRIVILEGE_NO.denyMessage.toString(), { name: '메시지 deny 권한', no: PRIVILEGE_NO.denyMessage });
PRIVILEGE_MAP.set(PRIVILEGE_NO.chageSortWeitghtForMessage.toString(), {
  name: '메시지 정렬 변경 권한',
  no: PRIVILEGE_NO.chageSortWeitghtForMessage,
});
PRIVILEGE_MAP.set(PRIVILEGE_NO.updateMessage.toString(), { name: '메시지 수정 권한', no: PRIVILEGE_NO.updateMessage });
PRIVILEGE_MAP.set(PRIVILEGE_NO.denyReply.toString(), { name: '댓글 deny 권한', no: PRIVILEGE_NO.denyReply });
PRIVILEGE_MAP.set(PRIVILEGE_NO.postReply.toString(), { name: '댓글 작성 권한', no: PRIVILEGE_NO.postReply });
PRIVILEGE_MAP.set(PRIVILEGE_NO.setPin.toString(), { name: '메시지 pin 권한', no: PRIVILEGE_NO.setPin });
PRIVILEGE_MAP.set(PRIVILEGE_NO.deleteReply.toString(), { name: '댓글 삭제 권한', no: PRIVILEGE_NO.deleteReply });
PRIVILEGE_MAP.set(PRIVILEGE_NO.addOrRemoveAdmin.toString(), {
  name: '관리자 추가/삭제 권한',
  no: PRIVILEGE_NO.addOrRemoveAdmin,
});
PRIVILEGE_MAP.set(PRIVILEGE_NO.addOrRemoveRole.toString(), {
  name: '관리자 권한 추가/삭제 권한',
  no: PRIVILEGE_NO.addOrRemoveRole,
});
