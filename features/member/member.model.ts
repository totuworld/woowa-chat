import CustomServerError from '@/controllers/custom_error/custom_server_error';
import { InAuthUser } from '@/hooks/interface/in_auth_user';
import FirebaseAdmin from '@/models/firebase_admin';

const MEMBER_COLLECTION = 'members';

// limit과 startAfter를 활용한 페이지네이션
async function getMembersWithPagination(limit = 10, lastDoc = null) {
  const eventColRef = FirebaseAdmin.getInstance().Firestore.collection(MEMBER_COLLECTION);

  let query = eventColRef.limit(limit);
  if (lastDoc) {
    query = query.startAfter(lastDoc);
  }

  const data = await query.get();
  const lastVisible = data.docs[data.docs.length - 1];

  return {
    members: data.docs.map((doc) => doc.data() as InAuthUser),
    lastVisible,
    hasMore: data.docs.length === limit,
  };
}

async function find({ uid }: { uid: string }) {
  const eventColRef = FirebaseAdmin.getInstance().Firestore.collection(MEMBER_COLLECTION);
  const targetRef = eventColRef.doc(uid);
  const data = await targetRef.get();
  if (data.exists === false) {
    throw new CustomServerError({ statusCode: 404, message: '목록에 존재하지 않는 멤버입니다.' });
  }
  return data.data() as InAuthUser;
}

async function update({ uid, data }: { uid: string; data: Partial<InAuthUser> }) {
  const eventColRef = FirebaseAdmin.getInstance().Firestore.collection(MEMBER_COLLECTION);
  const targetRef = eventColRef.doc(uid);
  await targetRef.update(data);
}

const MemberModel = {
  getMembersWithPagination,
  update,
  find,
};

export default MemberModel;
