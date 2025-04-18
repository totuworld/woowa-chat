// members 콜렉션 내에 문서를 읽는다.
// 해당 문서에서 email 정보를 뽑는다.
// division_info 콜렉션에서 해당 email로 정보를 찾는다.
// 정보가 존재한다면! division, center 정보를 뽑는다.

import MemberModel from '@/features/member/member.model';
import FirebaseAdmin from '@/models/firebase_admin';

const DIVISION_INFO = 'division_info';

// division, center 정보가 각각 있다면 있는대로 업데이트 없다면, 없는대로 업데이트 처리한다

export default async function updateDivisionInfo() {
  async function processNextBatch(lastVisible: any | null = null): Promise<void> {
    const limit = 20;
    const result = await MemberModel.getMembersWithPagination(limit, lastVisible);
    const { members, lastVisible: newLastVisible, hasMore } = result;
    const updatePromises = members.map(async (member) => {
      try {
        const { email } = member;
        if (email === undefined || email === null) {
          return;
        }
        const divisionInfo = await FirebaseAdmin.getInstance().Firestore.collection(DIVISION_INFO).doc(email).get();
        if (divisionInfo.exists) {
          const division = divisionInfo.data()?.division;
          const center = divisionInfo.data()?.center;
          const updateValue: { division: string | null; center: string | null } = {
            division: division !== undefined && division !== null ? division : null,
            center: center !== undefined && center !== null ? center : null,
          };
          await MemberModel.update({ uid: member.uid, data: updateValue });
        } else {
          await MemberModel.update({ uid: member.uid, data: { division: null, center: null } });
        }
      } catch (error) {
        console.error(error);
      }
    });
    await Promise.all(updatePromises);
    if (hasMore) {
      return processNextBatch(newLastVisible);
    }
  }

  await processNextBatch();
}
