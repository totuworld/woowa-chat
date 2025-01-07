import { firestore } from 'firebase-admin';
import FirebaseAdmin from '@/models/firebase_admin';
import FieldValue = firestore.FieldValue;
import CustomServerError from '@/controllers/custom_error/custom_server_error';

const LEADER_MEMBER_INFO = 'leader_members/members';
const OWNER_MEMBER_COLLECTION = 'owner_members';

async function list(senderUid: string) {
  const eventColRef = FirebaseAdmin.getInstance().Firestore.doc(LEADER_MEMBER_INFO);
  const ownerMemberColRef = FirebaseAdmin.getInstance().Firestore.collection(OWNER_MEMBER_COLLECTION);
  const requestOwnerRef = ownerMemberColRef.doc(senderUid);
  const requestOwnerDoc = await requestOwnerRef.get();
  if (requestOwnerDoc.exists === false) {
    throw new CustomServerError({ statusCode: 403, message: '리더 관리 권한이 없습니다.' });
  }
  const eventListSnap = await eventColRef.get();
  return eventListSnap.data() as { members: string[] };
}

async function remove(email: string, senderUid: string) {
  const ownerMemberColRef = FirebaseAdmin.getInstance().Firestore.collection(OWNER_MEMBER_COLLECTION);
  const requestOwnerRef = ownerMemberColRef.doc(senderUid);
  const requestOwnerDoc = await requestOwnerRef.get();
  if (requestOwnerDoc.exists === false) {
    throw new CustomServerError({ statusCode: 403, message: '리더 관리 권한이 없습니다.' });
  }
  const eventColRef = FirebaseAdmin.getInstance().Firestore.doc(LEADER_MEMBER_INFO);
  await eventColRef.update({
    members: FieldValue.arrayRemove(email),
  });
}

async function add(email: string, senderUid: string) {
  const ownerMemberColRef = FirebaseAdmin.getInstance().Firestore.collection(OWNER_MEMBER_COLLECTION);
  const requestOwnerRef = ownerMemberColRef.doc(senderUid);
  const requestOwnerDoc = await requestOwnerRef.get();
  if (requestOwnerDoc.exists === false) {
    throw new CustomServerError({ statusCode: 403, message: '리더 관리 권한이 없습니다.' });
  }
  const eventColRef = FirebaseAdmin.getInstance().Firestore.doc(LEADER_MEMBER_INFO);
  await eventColRef.update({
    members: FieldValue.arrayUnion(email),
  });
}

const LeaderMemberModel = {
  list,
  remove,
  add,
};

export default LeaderMemberModel;
