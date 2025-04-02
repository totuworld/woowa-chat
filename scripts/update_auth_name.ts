import FirebaseAdminModel from '@/models/firebase_admin';
import MemberModel from '@/features/member/member.model';

/**
 * 이름에 '/'가 포함된 멤버의 Firebase Auth 이름만 수정하는 스크립트
 */
async function updateAuthDisplayNameForMembersWithSlash() {
  console.log('이름에 /가 포함된 멤버의 Firebase Auth 정보 업데이트 시작...');
  const updatedMembers: string[] = [];

  // 재귀 함수로 페이지네이션 구현
  async function processNextBatch(lastVisible: any | null = null): Promise<void> {
    const limit = 20;
    const result = await MemberModel.getMembersWithPagination(limit, lastVisible);
    const { members, lastVisible: newLastVisible, hasMore } = result;

    // 이름에 '/'가 포함된 멤버 필터링
    const membersWithSlash = members.filter((member) => member.displayName && member.displayName.includes('/'));

    // 필터링된 멤버의 Auth 정보 병렬로 업데이트
    const updatePromises = membersWithSlash.map(async (member) => {
      try {
        const newName = member.displayName;
        await FirebaseAdminModel.getInstance().Auth.updateUser(member.uid, {
          displayName: newName,
        });
        const oldName = await FirebaseAdminModel.getInstance().Auth.getUserByEmail(member.email!);
        updatedMembers.push(`${member.uid} (${member.displayName} -> ${newName})`);
        console.log(`Firebase Auth 이름 업데이트 완료: ${member.uid}, 이름: ${oldName.displayName} -> ${newName}`);
      } catch (error) {
        console.error(`Firebase Auth 이름 업데이트 실패: ${member.uid}`, error);
      }
    });

    // 모든 업데이트가 완료될 때까지 대기
    await Promise.all(updatePromises);

    // 다음 페이지가 있으면 재귀 호출
    if (hasMore) {
      return processNextBatch(newLastVisible);
    }
  }

  // 첫 페이지부터 처리 시작
  await processNextBatch();

  console.log('업데이트 완료된 회원 목록:');
  updatedMembers.forEach((info, index) => {
    console.log(`${index + 1}. ${info}`);
  });
  console.log(`총 ${updatedMembers.length}명의 Firebase Auth 정보가 업데이트되었습니다.`);
}

export default updateAuthDisplayNameForMembersWithSlash;
