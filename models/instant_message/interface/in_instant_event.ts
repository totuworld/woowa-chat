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
  /** 상단 타이틀바 이미지 */
  titleImg?: string;
  /** 배경 이미지 */
  bgImg?: string;
}
