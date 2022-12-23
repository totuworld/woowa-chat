import FirebaseAdmin from '@/models/firebase_admin';
import CustomServerError from '@/controllers/custom_error/custom_server_error';
import InCategory from './in_category';

const CATEGORY_COLLECTION = 'instant_category';
const OWNER_MEMBER_COLLECTION = 'owner_members';

async function list({ reqUid }: { reqUid: string }) {
  const categoryColRef = FirebaseAdmin.getInstance().Firestore.collection(OWNER_MEMBER_COLLECTION);
  const ownerMemberColRef = FirebaseAdmin.getInstance().Firestore.collection(OWNER_MEMBER_COLLECTION);
  const requestOwnerRef = ownerMemberColRef.doc(reqUid);
  const result = await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const requestOwnerDoc = await transaction.get(requestOwnerRef);
    if (requestOwnerDoc.exists === false) {
      throw new CustomServerError({ statusCode: 403, message: '권한이 없습니다.' });
    }
    const categoryListSnap = await transaction.get(categoryColRef);
    const data = categoryListSnap.docs;
    const allCategory: InCategory[] = data.map((mv) => {
      const mvData = mv.data() as InCategory;
      return { ...mvData, id: mv.id };
    });
    return allCategory;
  });
  return result;
}

async function add({ newCategory, reqUid }: { newCategory: InCategory; reqUid: string }) {
  const ownerMemberColRef = FirebaseAdmin.getInstance().Firestore.collection(OWNER_MEMBER_COLLECTION);
  const requestOwnerRef = ownerMemberColRef.doc(reqUid);
  await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const requestOwnerDoc = await transaction.get(requestOwnerRef);
    if (requestOwnerDoc.exists === false) {
      throw new CustomServerError({ statusCode: 403, message: '카테고리를 추가할 권한이 없습니다.' });
    }

    const newRef = FirebaseAdmin.getInstance().Firestore.collection(CATEGORY_COLLECTION).doc();
    await transaction.set(newRef, { ...newCategory });
  });
}

async function update({
  id,
  title,
  visible,
  sortWeight,
  reqUid,
}: {
  id: string;
  title?: string;
  visible?: boolean;
  sortWeight?: number;
  reqUid: string;
}) {
  const ownerMemberColRef = FirebaseAdmin.getInstance().Firestore.collection(OWNER_MEMBER_COLLECTION);
  const requestOwnerRef = ownerMemberColRef.doc(reqUid);
  const updateRef = FirebaseAdmin.getInstance().Firestore.collection(CATEGORY_COLLECTION).doc(id);
  const result = await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const requestOwnerDoc = await transaction.get(requestOwnerRef);
    if (requestOwnerDoc.exists === false) {
      throw new CustomServerError({ statusCode: 403, message: '카테고리를 수정할 권한이 없습니다.' });
    }
    const oldDataSnap = await transaction.get(updateRef);
    if (oldDataSnap.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 카테고리' });
    }
    const oldData = oldDataSnap.data() as InCategory;
    const updateBody: { visible?: boolean; title?: string; sortWeight?: number } = {};
    if (title !== undefined) {
      updateBody.title = title;
    }
    if (visible !== undefined) {
      updateBody.visible = visible;
    }
    if (sortWeight !== undefined) {
      updateBody.sortWeight = sortWeight;
    }
    const mergeData = { ...oldData, ...updateBody };
    await transaction.update(updateRef, mergeData);
    return mergeData;
  });
  return result;
}

const CategoryModel = {
  list,
  add,
  update,
};

export default CategoryModel;
