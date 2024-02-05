export interface InInstantEvent {
  instantEventId: string;
  title: string;
  desc?: string;
  startDate: string;
  endDate: string;
  /** 종료 여부를 확인 */
  closed: boolean;
  /** 댓글 등록이 불가능 여부 */
  locked?: boolean;
  /** 일반 사용자에게 댓글까지 공개할지 여부 */
  showAllReply?: boolean;
  /** 상단 타이틀바 이미지 */
  titleImg?: string;
  /** 배경 이미지 */
  bgImg?: string;
  /** 댓글 수집 기간 여부 */
  collectReply?: boolean;
}
