export default interface InCategory {
  id: string;
  /** 정렬 가중치 */
  sortWeight: number;
  title: string;
  /** 사용자가 볼 수 있는지 여부. */
  visible: boolean;
  /** 액세스 권한 */
  accessPrivileges: 'ALL' | 'MANAGER' | 'ADMIN' | 'SUPER_ADMIN';
}
