export interface InOwnerMember {
  uid: string;
  displayName: string;
  email: string;
  desc?: string;
  /** 권한 목록 */
  privilege: number[];
}
