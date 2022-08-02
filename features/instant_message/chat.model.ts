import { firestore } from 'firebase-admin';
import moment from 'moment';
import { DateTime } from 'luxon';
import { nanoid } from 'nanoid';
import CustomServerError from '@/controllers/custom_error/custom_server_error';
import FirebaseAdmin from '../../models/firebase_admin';
import { InInstantEvent } from '../../models/instant_message/interface/in_instant_event';
import FieldValue = firestore.FieldValue;
import {
  InInstantEventDownloadItem,
  InInstantEventMessage,
  InInstantEventMessageServer,
} from '@/models/instant_message/interface/in_instant_event_message';

const INSTANT_EVENT = 'instants';
const INSTANT_EVENT_INFO = 'collection_info/instants';
const INSTANT_MESSAGE = 'messages';

const OWNER_MEMBER_COLLECTION = 'owner_members';

async function findAllEvent(): Promise<InInstantEvent[]> {
  const eventColRef = FirebaseAdmin.getInstance().Firestore.collection(INSTANT_EVENT);
  const result = await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const eventListSnap = await transaction.get(eventColRef);

    const data = eventListSnap.docs;

    const allEvent: InInstantEvent[] = data.reduce((acc: InInstantEvent[], doc) => {
      const innerData = doc.data() as InInstantEvent;
      if (innerData.closed !== undefined && innerData.closed === false) {
        acc.push({ ...innerData, instantEventId: doc.id });
      }
      return acc;
    }, []);
    return allEvent;
  });
  return result;
}

/** 우수타 이벤트 생성 */
async function create({
  title,
  desc,
  startDate,
  endDate,
  titleImg,
  bgImg,
}: {
  title: string;
  desc?: string;
  startDate: string;
  endDate: string;
  titleImg?: string;
  bgImg?: string;
}) {
  const newInstantEventBody: {
    title: string;
    desc?: string;
    startDate: string;
    endDate: string;
    closed: boolean;
    titleImg?: string;
    bgImg?: string;
  } = {
    title,
    startDate,
    endDate,
    closed: false,
  };
  if (desc !== undefined) {
    newInstantEventBody.desc = desc.replace(/\n/g, '\\n');
  }
  if (titleImg !== undefined) {
    newInstantEventBody.titleImg = titleImg;
  }
  if (bgImg !== undefined) {
    newInstantEventBody.bgImg = bgImg;
  }
  const collectionInfoRef = FirebaseAdmin.getInstance().Firestore.doc(INSTANT_EVENT_INFO);
  const instantCollection = FirebaseAdmin.getInstance().Firestore.collection(INSTANT_EVENT);
  await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const collectionInfoDoc = await transaction.get(collectionInfoRef);
    let count = 0;
    if (collectionInfoDoc.exists) {
      const collectionInfo = collectionInfoDoc.data() as { count: number };
      count = collectionInfo.count;
    }
    const newRef = instantCollection.doc();
    const setCount = count + 1;
    await transaction.set(newRef, { ...newInstantEventBody, createCount: setCount });
    if (collectionInfoDoc.exists === true) {
      await transaction.update(collectionInfoRef, { count: FieldValue.increment(1) });
    }
    if (collectionInfoDoc.exists === false) {
      await transaction.set(collectionInfoRef, { count: 1 });
    }
  });
}

async function update({
  instantEventId,
  title,
  desc,
  startDate,
  endDate,
  titleImg,
  bgImg,
}: {
  instantEventId: string;
  title: string;
  desc?: string;
  startDate: string;
  endDate: string;
  titleImg?: string;
  bgImg?: string;
}) {
  const updateInstantEventBody: {
    title: string;
    desc?: string;
    startDate: string;
    endDate: string;
    closed: boolean;
    titleImg?: string;
    bgImg?: string;
  } = {
    title,
    startDate,
    endDate,
    closed: false,
  };
  if (desc !== undefined) {
    updateInstantEventBody.desc = desc.replace(/\n/g, '\\n');
  }
  if (titleImg !== undefined) {
    updateInstantEventBody.titleImg = titleImg;
  }
  if (bgImg !== undefined) {
    updateInstantEventBody.bgImg = bgImg;
  }
  const eventRef = FirebaseAdmin.getInstance().Firestore.collection(INSTANT_EVENT).doc(instantEventId);
  await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const eventDoc = await transaction.get(eventRef);
    if (eventDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 이벤트 ☠️' });
    }
    await transaction.update(eventRef, { ...updateInstantEventBody });
  });
}

/** 우수타 이벤트 정보를 조회 */
async function get({ instantEventId }: { instantEventId: string }) {
  const eventRef = FirebaseAdmin.getInstance().Firestore.collection(INSTANT_EVENT).doc(instantEventId);
  const infoResp: InInstantEvent = await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const eventDoc = await transaction.get(eventRef);
    if (eventDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 이벤트에 질문을 보내고 있네요 ☠️' });
    }
    const info = eventDoc.data() as InInstantEvent;
    return {
      ...info,
      instantEventId: eventDoc.id,
    };
  });
  return infoResp;
}

/** 우수타 이벤트 잠금 처리 - 더이상 댓글 등록이 불가능해짐 */
async function lock({ instantEventId }: { instantEventId: string }) {
  const eventRef = FirebaseAdmin.getInstance().Firestore.collection(INSTANT_EVENT).doc(instantEventId);
  await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const eventDoc = await transaction.get(eventRef);
    if (eventDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 이벤트 ☠️' });
    }
    await transaction.update(eventRef, { locked: true });
  });
}

/** 우수타 이벤트 종료 처리 - 질문이나 댓글을 미노출 */
async function close({ instantEventId }: { instantEventId: string }) {
  const eventRef = FirebaseAdmin.getInstance().Firestore.collection(INSTANT_EVENT).doc(instantEventId);
  await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const eventDoc = await transaction.get(eventRef);
    if (eventDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 이벤트 ☠️' });
    }
    await transaction.update(eventRef, { closed: true });
  });
}

async function reopen({ instantEventId }: { instantEventId: string }) {
  const eventRef = FirebaseAdmin.getInstance().Firestore.collection(INSTANT_EVENT).doc(instantEventId);
  await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const eventDoc = await transaction.get(eventRef);
    if (eventDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 이벤트 ☠️' });
    }
    await transaction.update(eventRef, { closed: false });
  });
}

/** 메시지 작성 기간을 즉시 종료하는 옵션 */
async function closeSendMessage({ instantEventId }: { instantEventId: string }) {
  const eventRef = FirebaseAdmin.getInstance().Firestore.collection(INSTANT_EVENT).doc(instantEventId);
  await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const eventDoc = await transaction.get(eventRef);
    if (eventDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 이벤트 ☠️' });
    }
    // 마감날짜를 현재를 기준으로 입력해서 종료해버린다.
    const now = moment();
    await transaction.update(eventRef, { endDate: now.toISOString() });
  });
}

/** 질문 등록 */
async function post({ instantEventId, message }: { instantEventId: string; message: string }) {
  const eventRef = FirebaseAdmin.getInstance().Firestore.collection(INSTANT_EVENT).doc(instantEventId);
  await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const eventDoc = await transaction.get(eventRef);

    if (eventDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 이벤트에 질문을 보내고 있네요 ☠️' });
    }
    // 이벤트 정보 확인
    const eventInfo = eventDoc.data() as InInstantEvent;
    // 이미 폐쇄된 이벤트인가?
    if (eventInfo.closed !== undefined && eventInfo.closed) {
      throw new CustomServerError({ statusCode: 400, message: '종료된 이벤트에 질문을 보내고 있네요 ☠️' });
    }
    // 잠긴 이벤트인가?
    if (eventInfo.locked !== undefined && eventInfo.locked) {
      throw new CustomServerError({ statusCode: 400, message: '잠긴 이벤트에 질문을 보내고 있네요 ☠️' });
    }
    // 종료 날짜가 있나?
    if (eventInfo.endDate !== undefined) {
      const isBefore = moment().isBefore(moment(eventInfo.endDate, moment.ISO_8601));
      if (isBefore === false) {
        await transaction.update(eventRef, { closed: true });
        throw new CustomServerError({ statusCode: 400, message: '종료된 이벤트에 질문을 보내고 있네요 ☠️' });
      }
    }
    const newPostRef = eventRef.collection(INSTANT_MESSAGE).doc();
    await transaction.create(newPostRef, { message, vote: 0, sortWeight: 0, createAt: FieldValue.serverTimestamp() });
  });
}

async function messageList({ instantEventId, currentUserUid }: { instantEventId: string; currentUserUid: string }) {
  const result = await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const ownerMemberRef = FirebaseAdmin.getInstance()
      .Firestore.collection(OWNER_MEMBER_COLLECTION)
      .doc(currentUserUid);
    const colRef = FirebaseAdmin.getInstance()
      .Firestore.collection(INSTANT_EVENT)
      .doc(instantEventId)
      .collection(INSTANT_MESSAGE)
      .orderBy('sortWeight', 'desc')
      .orderBy('createAt', 'desc');
    const colDocs = await transaction.get(colRef);
    const ownerMemberDoc = await transaction.get(ownerMemberRef);
    const data = colDocs.docs.map((mv) => {
      const docData = mv.data() as Omit<InInstantEventMessageServer, 'id'>;
      const voted = (() => {
        if (docData.voter === undefined) {
          return false;
        }
        if (currentUserUid === undefined) {
          return false;
        }
        return docData.voter.findIndex((fv) => fv === currentUserUid) >= 0;
      })();
      const isOwnerMember = ownerMemberDoc.exists;
      const returnData = {
        ...docData,
        id: mv.id,
        voter: [],
        voted,
        message: docData.deny !== undefined && docData.deny === true ? '비공개 처리된 메시지입니다.' : docData.message,
        reply:
          docData.reply !== undefined && isOwnerMember
            ? docData.reply.map((replyMv) => {
                if (replyMv.deny !== undefined && replyMv.deny) {
                  return { ...replyMv, reply: '비공개 처리된 메시지입니다.' };
                }
                return { ...replyMv };
              })
            : [],
        createAt: docData.createAt.toDate().toISOString(),
        updateAt: docData.updateAt ? docData.updateAt.toDate().toISOString() : undefined,
      } as InInstantEventMessage;
      return returnData;
    });
    return data;
  });
  return result;
}

/** 다운로드 처리를 위해서 데이터를 array로 제공 */
async function messageListForDownload({
  instantEventId,
  currentUserUid,
}: {
  instantEventId: string;
  currentUserUid: string;
}) {
  const result = await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const ownerMemberRef = FirebaseAdmin.getInstance()
      .Firestore.collection(OWNER_MEMBER_COLLECTION)
      .doc(currentUserUid);
    const colRef = FirebaseAdmin.getInstance()
      .Firestore.collection(INSTANT_EVENT)
      .doc(instantEventId)
      .collection(INSTANT_MESSAGE)
      .orderBy('sortWeight', 'desc')
      .orderBy('createAt', 'desc');
    const colDocs = await transaction.get(colRef);
    const ownerMemberDoc = await transaction.get(ownerMemberRef);
    const isOwnerMember = ownerMemberDoc.exists;
    const data = colDocs.docs.reduce((acc: InInstantEventDownloadItem[], mv) => {
      const docData = mv.data() as Omit<InInstantEventMessageServer, 'id'>;
      const defaultInfo = {
        id: mv.id,
        vote: docData.vote,
        message: docData.deny !== undefined && docData.deny === true ? '비공개 처리된 메시지입니다.' : docData.message,
        createAt: DateTime.fromJSDate(docData.createAt.toDate()).setZone('Asia/Seoul').toFormat('yyyy-MM-dd HH:mm:ss'),
      };
      const returnData =
        docData.reply !== undefined && isOwnerMember
          ? docData.reply.map((replyMv) => {
              if (replyMv.deny !== undefined && replyMv.deny) {
                return {
                  ...defaultInfo,
                  reply: '비공개 처리된 메시지입니다.',
                  replyAt: DateTime.fromISO(replyMv.createAt).setZone('Asia/Seoul').toFormat('yyyy-MM-dd HH:mm:ss'),
                };
              }
              return {
                ...defaultInfo,
                reply: replyMv.reply,
                replyAt: DateTime.fromISO(replyMv.createAt).setZone('Asia/Seoul').toFormat('yyyy-MM-dd HH:mm:ss'),
              };
            })
          : [{ ...defaultInfo, reply: '', replyAt: '' }];
      return [...acc, ...returnData];
    }, []);
    return data;
  });
  return result;
}

async function messageInfo({
  instantEventId,
  messageId,
  currentUserUid,
}: {
  instantEventId: string;
  messageId: string;
  currentUserUid: string;
}): Promise<InInstantEventMessage> {
  const eventRef = FirebaseAdmin.getInstance().Firestore.collection(INSTANT_EVENT).doc(instantEventId);
  const messageRef = eventRef.collection(INSTANT_MESSAGE).doc(messageId);
  const ownerMemberRef = FirebaseAdmin.getInstance().Firestore.collection(OWNER_MEMBER_COLLECTION).doc(currentUserUid);
  const resp = await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const eventDoc = await transaction.get(eventRef);
    const messageDoc = await transaction.get(messageRef);
    const ownerMemberDoc = await transaction.get(ownerMemberRef);
    if (eventDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 이벤트의 정보를 조회 중' });
    }
    if (messageDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 메시지를 조회 중' });
    }
    return { docData: messageDoc.data() as InInstantEventMessageServer, isOwnerMember: ownerMemberDoc.exists };
  });
  const voted = (() => {
    if (resp.docData.voter === undefined) {
      return false;
    }
    if (currentUserUid === undefined) {
      return false;
    }
    return resp.docData.voter.findIndex((fv) => fv === currentUserUid) >= 0;
  })();
  return {
    ...resp.docData,
    voted,
    message:
      resp.docData.deny !== undefined && resp.docData.deny === true
        ? '비공개 처리된 메시지입니다.'
        : resp.docData.message,
    reply:
      resp.docData.reply !== undefined && resp.isOwnerMember
        ? resp.docData.reply.map((mv) => {
            if (mv.deny !== undefined && mv.deny) {
              return { ...mv, reply: '비공개 처리된 메시지입니다.' };
            }
            return { ...mv };
          })
        : [],
    id: messageId,
    voter: [],
    createAt: resp.docData.createAt.toDate().toISOString(),
    updateAt: resp.docData.updateAt ? resp.docData.updateAt.toDate().toISOString() : undefined,
  };
}

async function updateMessageSortWeight({
  instantEventId,
  messageId,
  sortWeight,
}: {
  instantEventId: string;
  messageId: string;
  sortWeight: number;
}): Promise<void> {
  const eventRef = FirebaseAdmin.getInstance().Firestore.collection(INSTANT_EVENT).doc(instantEventId);
  const messageRef = eventRef.collection(INSTANT_MESSAGE).doc(messageId);
  await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const eventDoc = await transaction.get(eventRef);
    const messageDoc = await transaction.get(messageRef);
    if (eventDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 이벤트' });
    }
    if (messageDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 메시지' });
    }
    await transaction.update(messageRef, { sortWeight });
  });
}

/** 특정 메시지를 deny 한다 */
async function denyMessage({
  instantEventId,
  messageId,
  deny = true,
}: {
  instantEventId: string;
  messageId: string;
  deny?: boolean;
}): Promise<void> {
  const eventRef = FirebaseAdmin.getInstance().Firestore.collection(INSTANT_EVENT).doc(instantEventId);
  const messageRef = eventRef.collection(INSTANT_MESSAGE).doc(messageId);
  await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const eventDoc = await transaction.get(eventRef);
    const messageDoc = await transaction.get(messageRef);
    if (eventDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 이벤트' });
    }
    if (messageDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 메시지' });
    }
    await transaction.update(messageRef, { deny });
  });
}

/** 특정 메시지의 특정 댓글을 deny 한다. */
async function denyReply({
  instantEventId,
  messageId,
  replyId,
  deny = true,
}: {
  instantEventId: string;
  messageId: string;
  replyId: string;
  deny?: boolean;
}): Promise<void> {
  const eventRef = FirebaseAdmin.getInstance().Firestore.collection(INSTANT_EVENT).doc(instantEventId);
  const messageRef = eventRef.collection(INSTANT_MESSAGE).doc(messageId);
  await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const eventDoc = await transaction.get(eventRef);
    const messageDoc = await transaction.get(messageRef);
    if (eventDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 이벤트' });
    }
    if (messageDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 메시지' });
    }
    const info = messageDoc.data() as InInstantEventMessageServer;
    const prevReplyList = info.reply === undefined ? [] : [...info.reply];
    if (prevReplyList.length < 0) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 댓글' });
    }
    const replyIdx = prevReplyList.findIndex((fv) => fv.id === replyId);
    if (replyIdx < 0) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 댓글' });
    }
    prevReplyList[replyIdx].deny = deny;
    await transaction.update(messageRef, { reply: prevReplyList });
  });
}

async function voteMessage({
  instantEventId,
  messageId,
  voter,
  isUpvote,
}: {
  instantEventId: string;
  messageId: string;
  voter: string;
  isUpvote: boolean;
}) {
  const eventRef = FirebaseAdmin.getInstance().Firestore.collection(INSTANT_EVENT).doc(instantEventId);
  const messageRef = eventRef.collection(INSTANT_MESSAGE).doc(messageId);
  await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const eventDoc = await transaction.get(eventRef);
    const messageDoc = await transaction.get(messageRef);
    if (eventDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 이벤트' });
    }
    if (messageDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 메시지' });
    }
    const eventInfo = eventDoc.data() as InInstantEvent;
    // 이미 폐쇄된 이벤트인가?
    if (eventInfo.closed !== undefined && eventInfo.closed) {
      throw new CustomServerError({ statusCode: 400, message: '종료된 이벤트' });
    }
    // 잠긴 이벤트인가?
    if (eventInfo.locked !== undefined && eventInfo.locked) {
      throw new CustomServerError({ statusCode: 400, message: '잠긴 이벤트' });
    }
    const messageData = messageDoc.data() as InInstantEventMessageServer;
    const voterList = (() => {
      if (messageData.voter === undefined) {
        return [voter];
      }
      const findVoterIndex = messageData.voter.findIndex((fv) => fv === voter);
      if (findVoterIndex > -1) {
        return [...messageData.voter].filter((fv) => fv !== voter);
      }
      return [...messageData.voter, voter];
    })();
    await transaction.update(messageRef, {
      vote: FieldValue.increment(isUpvote ? 1 : -1),
      voter: voterList,
    });
  });
}

async function postReply({
  instantEventId,
  messageId,
  reply,
  author,
}: {
  instantEventId: string;
  messageId: string;
  reply: string;
  author?: {
    displayName: string;
    photoURL?: string;
  };
}) {
  const eventRef = FirebaseAdmin.getInstance().Firestore.collection(INSTANT_EVENT).doc(instantEventId);
  const messageRef = eventRef.collection(INSTANT_MESSAGE).doc(messageId);
  await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const eventDoc = await transaction.get(eventRef);
    const messageDoc = await transaction.get(messageRef);
    if (eventDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 이벤트의 정보를 조회 중' });
    }
    // 이벤트 정보 확인
    const eventInfo = eventDoc.data() as InInstantEvent;
    // 이미 폐쇄된 이벤트인가?
    if (eventInfo.closed !== undefined && eventInfo.closed) {
      throw new CustomServerError({ statusCode: 400, message: '종료된 이벤트 ☠️' });
    }
    // 잠긴 이벤트인가?
    if (eventInfo.locked !== undefined && eventInfo.locked) {
      throw new CustomServerError({ statusCode: 400, message: '잠긴 이벤트 ☠️' });
    }
    if (messageDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 메시지를 조회 중' });
    }
    const info = messageDoc.data() as InInstantEventMessageServer;
    const newId = nanoid(4);
    const addReply: {
      id: string;
      reply: string;
      createAt: string;
      author?: {
        displayName: string;
        photoURL?: string;
      };
    } = { reply, createAt: moment().toISOString(), id: newId };
    if (author !== undefined) {
      addReply.author = author;
    }
    await transaction.update(messageRef, {
      reply: info.reply !== undefined ? [addReply, ...info.reply] : [addReply],
      updateAt: FieldValue.serverTimestamp(),
    });
  });
}

const ChatModel = {
  findAllEvent,
  create,
  update,
  close,
  reopen,
  lock,
  post,
  updateMessageSortWeight,
  get,
  messageList,
  messageListForDownload,
  messageInfo,
  closeSendMessage,
  denyMessage,
  voteMessage,
  postReply,
  denyReply,
};

export default ChatModel;
