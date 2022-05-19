import CustomServerError from '@/controllers/custom_error/custom_server_error';
import FirebaseAdmin from '@/models/firebase_admin';
import { InOwnerMember } from './in_owner_member';

const OWNER_MEMBER_COLLECTION = 'owner_members';

async function list({ reqUid }: { reqUid: string }) {
  const eventColRef = FirebaseAdmin.getInstance().Firestore.collection(OWNER_MEMBER_COLLECTION);
  const requestOwnerRef = eventColRef.doc(reqUid);
  const result = await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const requestOwnerDoc = await transaction.get(requestOwnerRef);
    if (requestOwnerDoc.exists === false) {
      throw new CustomServerError({ statusCode: 403, message: '멤버를 조회할 권한이 없습니다.' });
    }
    const eventListSnap = await transaction.get(eventColRef);
    const data = eventListSnap.docs;
    const allMembers: InOwnerMember[] = data.map((mv) => mv.data() as InOwnerMember);
    return allMembers;
  });
  return result;
}

async function find({ uid }: { uid: string }) {
  const eventColRef = FirebaseAdmin.getInstance().Firestore.collection(OWNER_MEMBER_COLLECTION);
  const targetRef = eventColRef.doc(uid);
  const data = await targetRef.get();
  if (data.exists === false) {
    throw new CustomServerError({ statusCode: 404, message: '목록에 존재하지 않는 멤버입니다.' });
  }
  return data.data() as InOwnerMember;
}

async function add({ newbie, reqUid }: { newbie: InOwnerMember; reqUid: string }) {
  const eventColRef = FirebaseAdmin.getInstance().Firestore.collection(OWNER_MEMBER_COLLECTION);
  const newbieRef = eventColRef.doc(newbie.uid);
  const requestOwnerRef = eventColRef.doc(reqUid);
  await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const requestOwnerDoc = await transaction.get(requestOwnerRef);
    if (requestOwnerDoc.exists === false) {
      throw new CustomServerError({ statusCode: 403, message: '멤버를 추가할 권한이 없습니다.' });
    }
    const newbieDoc = await transaction.get(newbieRef);
    if (newbieDoc.exists) {
      throw new CustomServerError({ statusCode: 400, message: '이미 추가된 멤버입니다.' });
    }
    await transaction.create(newbieRef, { ...newbie });
  });
}

async function remove({ uid, reqUid }: { uid: string; reqUid: string }) {
  const eventColRef = FirebaseAdmin.getInstance().Firestore.collection(OWNER_MEMBER_COLLECTION);
  const targetRef = eventColRef.doc(uid);
  const requestOwnerRef = eventColRef.doc(reqUid);
  await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const requestOwnerDoc = await transaction.get(requestOwnerRef);
    if (requestOwnerDoc.exists === false) {
      throw new CustomServerError({ statusCode: 403, message: '멤버를 제거할 권한이 없습니다.' });
    }
    const targetDoc = await transaction.get(targetRef);
    if (targetDoc.exists === false) {
      throw new CustomServerError({ statusCode: 404, message: '목록에 존재하지 않는 멤버입니다.' });
    }
    await transaction.delete(targetRef);
  });
}

async function update({
  uid,
  displayName,
  desc,
  reqUid,
}: {
  uid: string;
  displayName?: string;
  desc?: string;
  reqUid: string;
}) {
  const eventColRef = FirebaseAdmin.getInstance().Firestore.collection(OWNER_MEMBER_COLLECTION);
  const targetRef = eventColRef.doc(uid);
  const requestOwnerRef = eventColRef.doc(reqUid);
  await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const requestOwnerDoc = await transaction.get(requestOwnerRef);
    if (requestOwnerDoc.exists === false) {
      throw new CustomServerError({ statusCode: 403, message: '멤버를 수정할 권한이 없습니다.' });
    }
    const targetDoc = await transaction.get(targetRef);
    if (targetDoc.exists === false) {
      throw new CustomServerError({ statusCode: 404, message: '목록에 존재하지 않는 멤버입니다.' });
    }
    const oldData = targetDoc.data() as InOwnerMember;
    const updateData: { displayName: string; desc?: string } = {
      displayName: displayName ?? oldData.displayName,
    };
    if (desc !== undefined) {
      updateData.desc = desc;
    }
    await transaction.update(targetRef, updateData);
  });
}

const OwnerMemberModel = {
  list,
  add,
  remove,
  update,
  find,
};

export default OwnerMemberModel;
