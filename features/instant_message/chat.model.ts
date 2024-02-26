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
import InstantEventUtil from './instant_event.util';
import { REACTION_TYPE } from './message_item/reaction_type';
import { InOwnerMember } from '../owner_member/model/in_owner_member';
import { PRIVILEGE_NO } from '../owner_member/model/in_owner_privilege';

const INSTANT_EVENT = 'instants';
const INSTANT_EVENT_INFO = 'collection_info/instants';
const INSTANT_MESSAGE = 'messages';

const OWNER_MEMBER_COLLECTION = 'owner_members';

async function findAllEvent(): Promise<InInstantEvent[]> {
  const eventColRef = FirebaseAdmin.getInstance().Firestore.collection(INSTANT_EVENT).orderBy('createCount', 'desc');
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

async function findAllEventWithPage({ page = 1, size = 10 }: { page?: number; size?: number }) {
  const collectionInfoRef = FirebaseAdmin.getInstance().Firestore.doc(INSTANT_EVENT_INFO);
  const result = await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const collectionInfoDoc = await transaction.get(collectionInfoRef);
    // 전체 갯수를 조회
    const { count = 0 } = collectionInfoDoc.data() as { count?: number };
    const totalElements = count !== 0 ? count - 1 : 0;
    const remains = totalElements % size;
    const totalPages = (totalElements - remains) / size + (remains > 0 ? 1 : 0);
    // 전체 갯수에서 page 숫자만큼 숫자를 미뤄서 검색한다.
    const startAt = totalElements - (page - 1) * size;
    if (startAt < 0) {
      return {
        totalElements,
        totalPages: 0,
        page,
        size,
        content: [],
      };
    }
    const colRef = FirebaseAdmin.getInstance()
      .Firestore.collection(INSTANT_EVENT)
      .orderBy('createCount', 'desc')
      .startAt(startAt)
      .limit(size);
    const eventListSnap = await transaction.get(colRef);

    const data = eventListSnap.docs;

    const allEvent: InInstantEvent[] = data.map((doc) => {
      const innerData = doc.data() as InInstantEvent;
      return { ...innerData, instantEventId: doc.id };
    });
    return {
      totalElements,
      totalPages,
      page,
      size,
      content: allEvent,
    };
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

/** 우수타 이벤트 댓글 수집 처리 - 질문을 공개하고, 댓글 수집을 시작하는 상태 */
async function showMsgAndCollectReply({ instantEventId }: { instantEventId: string }) {
  const eventRef = FirebaseAdmin.getInstance().Firestore.collection(INSTANT_EVENT).doc(instantEventId);
  await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const eventDoc = await transaction.get(eventRef);
    if (eventDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 이벤트 ☠️' });
    }
    await transaction.update(eventRef, { collectReply: true });
  });
}

/** 우수타 이벤트 공개 처리 - 일반 사용자도 댓글까지 조회가능 */
async function publish({ instantEventId }: { instantEventId: string }) {
  const eventRef = FirebaseAdmin.getInstance().Firestore.collection(INSTANT_EVENT).doc(instantEventId);
  await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const eventDoc = await transaction.get(eventRef);
    if (eventDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 이벤트 ☠️' });
    }
    await transaction.update(eventRef, { showAllReply: true });
  });
}

/** 우수타 이벤트 비공개 처리 - lock 상태로 돌린다. */
async function unpublish({ instantEventId }: { instantEventId: string }) {
  const eventRef = FirebaseAdmin.getInstance().Firestore.collection(INSTANT_EVENT).doc(instantEventId);
  await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const eventDoc = await transaction.get(eventRef);
    if (eventDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 이벤트 ☠️' });
    }
    await transaction.update(eventRef, { showAllReply: false });
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

function extractReaction({
  reaction,
  isOwnerMember,
  isShowAll,
  voted,
  UID,
}: {
  reaction: InInstantEventMessage['reaction'];
  isOwnerMember: boolean;
  isShowAll: boolean;
  voted: boolean;
  UID: string;
}) {
  if (reaction === undefined) {
    return [];
  }
  if (reaction !== undefined && (isOwnerMember || isShowAll)) {
    return reaction.map((reactionMv) => ({ type: reactionMv.type, voter: '' }));
  }
  if (voted) {
    return reaction.filter((fv) => fv.voter === UID);
  }
  return [];
}

async function messageList({
  instantEventId,
  currentUserUid,
  isPreview = false,
}: {
  instantEventId: string;
  currentUserUid: string;
  isPreview?: boolean;
}) {
  const result = await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const ownerMemberRef = FirebaseAdmin.getInstance()
      .Firestore.collection(OWNER_MEMBER_COLLECTION)
      .doc(currentUserUid);
    const eventDocRef = FirebaseAdmin.getInstance().Firestore.collection(INSTANT_EVENT).doc(instantEventId);
    const colRef = eventDocRef.collection(INSTANT_MESSAGE).orderBy('sortWeight', 'desc').orderBy('createAt', 'desc');
    const eventDoc = await transaction.get(eventDocRef);
    const colDocs = await transaction.get(colRef);
    const ownerMemberDoc = await transaction.get(ownerMemberRef);
    const eventInfo = eventDoc.data() as InInstantEvent;
    const eventState = InstantEventUtil.calEventState(eventInfo);
    const isShowAll = eventState === 'showAll';
    const isOwnerMember = ownerMemberDoc.exists;
    const originData = colDocs.docs.map((mv) => {
      const docData = mv.data() as Omit<InInstantEventMessageServer, 'id'>;
      const voted = (() => {
        if (docData.reaction === undefined) {
          return false;
        }
        if (currentUserUid === undefined) {
          return false;
        }
        return docData.reaction.findIndex((fv) => fv.voter === currentUserUid) >= 0;
      })();
      if (isOwnerMember === false && docData.deny !== undefined && docData.deny === true) {
        return null;
      }
      const returnData = {
        ...docData,
        id: mv.id,
        voter: [],
        voted,
        reaction: extractReaction({ reaction: docData.reaction, isOwnerMember, isShowAll, voted, UID: currentUserUid }),
        message: docData.message,
        reply:
          docData.reply !== undefined && (isOwnerMember || isShowAll)
            ? docData.reply
                .map((replyMv) => {
                  if (replyMv.deny !== undefined && replyMv.deny) {
                    return { ...replyMv, reply: '비공개 처리된 메시지입니다.' };
                  }
                  return { ...replyMv };
                })
                .sort((a, b) => {
                  const isAOwnerCreate = a.createByOwner !== undefined && a.createByOwner === true;
                  const isBOwnerCreate = b.createByOwner !== undefined && b.createByOwner === true;
                  if (isAOwnerCreate === true && isBOwnerCreate === false) {
                    return 1;
                  }
                  if (isAOwnerCreate === false && isBOwnerCreate === true) {
                    return -1;
                  }
                  return new Date(a.createAt).getTime() - new Date(b.createAt).getTime();
                })
            : [],
        createAt: docData.createAt.toDate().toISOString(),
        updateAt: docData.updateAt ? docData.updateAt.toDate().toISOString() : undefined,
      } as InInstantEventMessage;
      return returnData;
    });
    const filteredData = originData.filter((fv): fv is InInstantEventMessage => fv !== null);
    // T상태가 전체 공개 혹은 preview flag가 있을 때 sort 룰 적용.
    // 공감해요 리액션이 많은걸 먼저 노출. 리액션 숫자 동률이면 댓글 많은 순. 댓글 숫자도 동률이면 나중에 등록한 질문 순
    if (isShowAll || (isPreview && isOwnerMember)) {
      const sortedData = filteredData.sort((a, b) => {
        const aReaction =
          a.reaction === undefined || a.reaction.length === 0
            ? 0
            : a.reaction.filter((fv) => fv.type === 'LIKE').length;
        const bReaction =
          b.reaction === undefined || b.reaction.length === 0
            ? 0
            : b.reaction.filter((fv) => fv.type === 'LIKE').length;
        return bReaction - aReaction;
      });
      const mapData = sortedData.map((mv) => ({
        ...mv,
        sortWeight: 0,
      }));
      return mapData;
    }
    return filteredData;
  });
  return result;
}

async function messageListWithUniqueVoter({
  instantEventId,
  currentUserUid,
}: {
  instantEventId: string;
  currentUserUid: string;
  isPreview?: boolean;
}): Promise<{
  list: InInstantEventMessage[];
  uniqueVoterCount: number;
}> {
  const result = await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const ownerMemberRef = FirebaseAdmin.getInstance()
      .Firestore.collection(OWNER_MEMBER_COLLECTION)
      .doc(currentUserUid);
    const eventDocRef = FirebaseAdmin.getInstance().Firestore.collection(INSTANT_EVENT).doc(instantEventId);
    const colRef = eventDocRef.collection(INSTANT_MESSAGE).orderBy('sortWeight', 'desc').orderBy('createAt', 'desc');
    const eventDoc = await transaction.get(eventDocRef);
    const colDocs = await transaction.get(colRef);
    const ownerMemberDoc = await transaction.get(ownerMemberRef);
    const eventInfo = eventDoc.data() as InInstantEvent;
    const eventState = InstantEventUtil.calEventState(eventInfo);
    const isShowAll = eventState === 'showAll';
    const isOwnerMember = ownerMemberDoc.exists;
    const voterSet = new Set<string>();
    const originData = colDocs.docs.map((mv) => {
      const docData = mv.data() as Omit<InInstantEventMessageServer, 'id'>;
      const voted = (() => {
        if (docData.reaction === undefined) {
          return false;
        }
        if (currentUserUid === undefined) {
          return false;
        }
        return docData.reaction.findIndex((fv) => fv.voter === currentUserUid) >= 0;
      })();
      if (isOwnerMember === false && docData.deny !== undefined && docData.deny === true) {
        return null;
      }
      const returnData = {
        ...docData,
        id: mv.id,
        voter: [],
        voted,
        reaction: extractReaction({ reaction: docData.reaction, isOwnerMember, isShowAll, voted, UID: currentUserUid }),
        message: docData.message,
        reply:
          docData.reply !== undefined && (isOwnerMember || isShowAll)
            ? docData.reply
                .map((replyMv) => {
                  if (replyMv.deny !== undefined && replyMv.deny) {
                    return { ...replyMv, reply: '비공개 처리된 메시지입니다.' };
                  }
                  return { ...replyMv };
                })
                .sort((a, b) => {
                  const isAOwnerCreate = a.createByOwner !== undefined && a.createByOwner === true;
                  const isBOwnerCreate = b.createByOwner !== undefined && b.createByOwner === true;
                  if (isAOwnerCreate === true && isBOwnerCreate === false) {
                    return 1;
                  }
                  if (isAOwnerCreate === false && isBOwnerCreate === true) {
                    return -1;
                  }
                  return new Date(a.createAt).getTime() - new Date(b.createAt).getTime();
                })
            : [],
        createAt: docData.createAt.toDate().toISOString(),
        updateAt: docData.updateAt ? docData.updateAt.toDate().toISOString() : undefined,
      } as InInstantEventMessage;
      if (docData.reaction !== undefined) {
        docData.reaction.forEach((fv) => {
          voterSet.add(fv.voter);
        });
      }
      return returnData;
    });
    const filteredData = originData.filter((fv): fv is InInstantEventMessage => fv !== null);
    // T상태가 전체 공개 혹은 preview flag가 있을 때 sort 룰 적용.
    // 공감해요 리액션이 많은걸 먼저 노출. 리액션 숫자 동률이면 댓글 많은 순. 댓글 숫자도 동률이면 나중에 등록한 질문 순
    // if (isShowAll || (isPreview && isOwnerMember)) {
    //   const sortedData = filteredData.sort((a, b) => {
    //     const aReaction =
    //       a.reaction === undefined || a.reaction.length === 0
    //         ? 0
    //         : a.reaction.filter((fv) => fv.type === 'LIKE').length;
    //     const bReaction =
    //       b.reaction === undefined || b.reaction.length === 0
    //         ? 0
    //         : b.reaction.filter((fv) => fv.type === 'LIKE').length;
    //     return bReaction - aReaction;
    //   });
    //   const mapData = sortedData.map((mv) => ({
    //     ...mv,
    //     sortWeight: 0,
    //   }));
    //   return {
    //     list: mapData,
    //     uniqueVoterCount: voterSet.size,
    //   };
    // }
    return {
      list: filteredData,
      uniqueVoterCount: voterSet.size,
    };
  });
  return result;
}

interface ReactionReduce {
  [key: string]: number;
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
      const reduceReaction = (docData.reaction ?? []).reduce(
        (reAcc: ReactionReduce, reCur) => {
          reAcc[reCur.type] += 1;
          return reAcc;
        },
        {
          LIKE: 0,
          NEXT: 0,
          HAHA: 0,
          EYE: 0,
          CHEERUP: 0,
        },
      );
      const defaultInfo = {
        id: mv.id,
        vote: 0,
        LIKE: reduceReaction.LIKE ?? 0,
        NEXT: reduceReaction.NEXT ?? 0,
        HAHA: reduceReaction.HAHA ?? 0,
        EYE: reduceReaction.EYE ?? 0,
        CHEERUP: reduceReaction.CHEERUP ?? 0,
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
    const eventInfo = eventDoc.data() as InInstantEvent;
    const eventState = InstantEventUtil.calEventState(eventInfo);
    return {
      docData: messageDoc.data() as InInstantEventMessageServer,
      isOwnerMember: ownerMemberDoc.exists,
      isShowAll: eventState === 'showAll',
    };
  });
  const voted = (() => {
    if (resp.docData.reaction === undefined) {
      return false;
    }
    if (currentUserUid === undefined) {
      return false;
    }
    return resp.docData.reaction.findIndex((fv) => fv.voter === currentUserUid) >= 0;
  })();
  return {
    ...resp.docData,
    voted,
    reaction: extractReaction({
      reaction: resp.docData.reaction,
      isOwnerMember: resp.isOwnerMember,
      isShowAll: resp.isShowAll,
      voted,
      UID: currentUserUid,
    }),
    message:
      resp.isOwnerMember === false && resp.docData.deny !== undefined && resp.docData.deny === true
        ? '비공개 처리된 메시지입니다.'
        : resp.docData.message,
    reply:
      resp.docData.reply !== undefined && resp.isOwnerMember
        ? resp.docData.reply
            .map((mv) => {
              if (mv.deny !== undefined && mv.deny) {
                return { ...mv, reply: '비공개 처리된 메시지입니다.' };
              }
              return { ...mv };
            })
            .sort((a, b) => {
              const isAOwnerCreate = a.createByOwner !== undefined && a.createByOwner === true;
              const isBOwnerCreate = b.createByOwner !== undefined && b.createByOwner === true;
              if (isAOwnerCreate === true && isBOwnerCreate === false) {
                return 1;
              }
              if (isAOwnerCreate === false && isBOwnerCreate === true) {
                return -1;
              }
              return new Date(a.createAt).getTime() - new Date(b.createAt).getTime();
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
  currentUserId,
  deny = true,
}: {
  instantEventId: string;
  messageId: string;
  currentUserId: string;
  deny?: boolean;
}): Promise<void> {
  const eventRef = FirebaseAdmin.getInstance().Firestore.collection(INSTANT_EVENT).doc(instantEventId);
  const messageRef = eventRef.collection(INSTANT_MESSAGE).doc(messageId);
  const ownerMemberRef = FirebaseAdmin.getInstance().Firestore.collection(OWNER_MEMBER_COLLECTION).doc(currentUserId);
  await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const eventDoc = await transaction.get(eventRef);
    const messageDoc = await transaction.get(messageRef);
    const ownerMemberDoc = await transaction.get(ownerMemberRef);
    if (eventDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 이벤트' });
    }
    if (messageDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 메시지' });
    }
    if (ownerMemberDoc.exists === false) {
      throw new CustomServerError({ statusCode: 401, message: '권한없음' });
    }
    await transaction.update(messageRef, { deny });
  });
}

/** 특정 메시지의 특정 댓글을 deny 한다. */
async function denyReply({
  instantEventId,
  messageId,
  replyId,
  currentUserId,
  deny = true,
}: {
  instantEventId: string;
  messageId: string;
  replyId: string;
  currentUserId: string;
  deny?: boolean;
}): Promise<void> {
  const eventRef = FirebaseAdmin.getInstance().Firestore.collection(INSTANT_EVENT).doc(instantEventId);
  const messageRef = eventRef.collection(INSTANT_MESSAGE).doc(messageId);
  const ownerMemberRef = FirebaseAdmin.getInstance().Firestore.collection(OWNER_MEMBER_COLLECTION).doc(currentUserId);
  await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const eventDoc = await transaction.get(eventRef);
    const messageDoc = await transaction.get(messageRef);
    const ownerMemberDoc = await transaction.get(ownerMemberRef);
    if (eventDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 이벤트' });
    }
    if (messageDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 메시지' });
    }
    if (ownerMemberDoc.exists === false) {
      throw new CustomServerError({ statusCode: 401, message: '권한없음' });
    }
    const ownerInfo = ownerMemberDoc.data() as InOwnerMember;
    const hasPrivilege = ownerInfo.privilege.includes(PRIVILEGE_NO.denyReply);
    if (hasPrivilege === false) {
      throw new CustomServerError({ statusCode: 403, message: '댓글을 deny할 권한이 없습니다.' });
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

/** 특정 메시지의 특정 댓글을 delete 한다. */
async function deleteReply({
  instantEventId,
  messageId,
  replyId,
  currentUserId,
}: {
  instantEventId: string;
  messageId: string;
  replyId: string;
  currentUserId: string;
}): Promise<void> {
  const eventRef = FirebaseAdmin.getInstance().Firestore.collection(INSTANT_EVENT).doc(instantEventId);
  const messageRef = eventRef.collection(INSTANT_MESSAGE).doc(messageId);
  const ownerMemberRef = FirebaseAdmin.getInstance().Firestore.collection(OWNER_MEMBER_COLLECTION).doc(currentUserId);
  await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const eventDoc = await transaction.get(eventRef);
    const messageDoc = await transaction.get(messageRef);
    const ownerMemberDoc = await transaction.get(ownerMemberRef);
    if (eventDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 이벤트' });
    }
    if (messageDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 메시지' });
    }
    if (ownerMemberDoc.exists === false) {
      throw new CustomServerError({ statusCode: 401, message: '권한없음' });
    }
    const ownerInfo = ownerMemberDoc.data() as InOwnerMember;
    const hasPrivilege = ownerInfo.privilege.includes(PRIVILEGE_NO.deleteReply);
    if (hasPrivilege === false) {
      throw new CustomServerError({ statusCode: 403, message: '댓글을 삭제할 권한이 없습니다.' });
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
    const updateReplyList = [...prevReplyList].filter((fv) => fv.id !== replyId);
    await transaction.update(messageRef, { reply: updateReplyList });
  });
}

async function pinMessage({
  instantEventId,
  messageId,
  currentUserId,
}: {
  instantEventId: string;
  messageId: string;
  currentUserId: string;
}): Promise<void> {
  const eventRef = FirebaseAdmin.getInstance().Firestore.collection(INSTANT_EVENT).doc(instantEventId);
  const messageRef = eventRef.collection(INSTANT_MESSAGE).doc(messageId);
  const ownerMemberRef = FirebaseAdmin.getInstance().Firestore.collection(OWNER_MEMBER_COLLECTION).doc(currentUserId);
  await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const eventDoc = await transaction.get(eventRef);
    const messageDoc = await transaction.get(messageRef);
    const ownerMemberDoc = await transaction.get(ownerMemberRef);
    if (eventDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 이벤트' });
    }
    if (messageDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 메시지' });
    }
    if (ownerMemberDoc.exists === false) {
      throw new CustomServerError({ statusCode: 401, message: '권한없음' });
    }
    const ownerInfo = ownerMemberDoc.data() as InOwnerMember;
    const hasPrivilege = ownerInfo.privilege.includes(PRIVILEGE_NO.setPin);
    if (hasPrivilege === false) {
      throw new CustomServerError({ statusCode: 403, message: '메시지를 pin할 권한이 없습니다.' });
    }
    const info = messageDoc.data() as InInstantEventMessageServer;
    const pin = info.pin === undefined ? true : !info.pin;
    await transaction.update(messageRef, { pin });
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

async function reactionMessage({
  instantEventId,
  messageId,
  voter,
  reaction,
}: {
  instantEventId: string;
  messageId: string;
  voter: string;
  reaction: { type: REACTION_TYPE };
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
    const reactionList = (() => {
      // 리액션 정보 없으면 무조건 추가
      if (messageData.reaction === undefined) {
        return [{ voter, type: reaction.type }];
      }
      const findVoterIndex = messageData.reaction.findIndex((fv) => fv.voter === voter && fv.type === reaction.type);
      // 특정 리액션 제거
      if (findVoterIndex > -1) {
        return [...messageData.reaction].filter((_, idx) => idx !== findVoterIndex);
      }
      // 리액션 추가
      return [...messageData.reaction, { type: reaction.type, voter }];
    })();
    await transaction.update(messageRef, {
      reaction: reactionList,
    });
  });
}

/** 본문을 수정한다 */
async function updateMessage({
  instantEventId,
  messageId,
  currentUserId,
  message,
}: {
  instantEventId: string;
  messageId: string;
  currentUserId: string;
  message: string;
}): Promise<void> {
  const eventRef = FirebaseAdmin.getInstance().Firestore.collection(INSTANT_EVENT).doc(instantEventId);
  const messageRef = eventRef.collection(INSTANT_MESSAGE).doc(messageId);
  const ownerMemberRef = FirebaseAdmin.getInstance().Firestore.collection(OWNER_MEMBER_COLLECTION).doc(currentUserId);
  await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const eventDoc = await transaction.get(eventRef);
    const messageDoc = await transaction.get(messageRef);
    const ownerMemberDoc = await transaction.get(ownerMemberRef);
    if (eventDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 이벤트' });
    }
    if (messageDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 메시지' });
    }
    if (ownerMemberDoc.exists === false) {
      throw new CustomServerError({ statusCode: 401, message: '권한없음' });
    }
    await transaction.update(messageRef, { message });
  });
}

async function postReply({
  instantEventId,
  messageId,
  reply,
  currentUserId,
  author,
}: {
  instantEventId: string;
  messageId: string;
  reply: string;
  currentUserId: string;
  author?: {
    displayName: string;
    photoURL?: string;
  };
}) {
  const eventRef = FirebaseAdmin.getInstance().Firestore.collection(INSTANT_EVENT).doc(instantEventId);
  const messageRef = eventRef.collection(INSTANT_MESSAGE).doc(messageId);
  const ownerMemberRef = FirebaseAdmin.getInstance().Firestore.collection(OWNER_MEMBER_COLLECTION).doc(currentUserId);
  await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
    const eventDoc = await transaction.get(eventRef);
    const messageDoc = await transaction.get(messageRef);
    const ownerMemberDoc = await transaction.get(ownerMemberRef);
    const isOwnerMember = ownerMemberDoc.exists === true;
    if (eventDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 이벤트의 정보를 조회 중' });
    }
    // 이벤트 정보 확인
    const eventInfo = eventDoc.data() as InInstantEvent;
    // 이미 폐쇄된 이벤트인가?
    if (eventInfo.closed !== undefined && eventInfo.closed) {
      throw new CustomServerError({ statusCode: 400, message: '종료된 이벤트 ☠️' });
    }
    if (messageDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 메시지를 조회 중' });
    }
    // const ownerInfo = ownerMemberDoc.data() as InOwnerMember;
    // const hasPrivilege = ownerInfo.privilege.includes(PRIVILEGE_NO.postReply);
    // if (hasPrivilege === false) {
    //   throw new CustomServerError({ statusCode: 403, message: '댓글을 등록할 권한이 없습니다.' });
    // }
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
      createByOwner?: boolean;
    } = { reply, createAt: moment().toISOString(), id: newId };
    if (author !== undefined) {
      addReply.author = author;
    }
    // 관리자멤버가 author을 지정해서 올린경우
    if (isOwnerMember && author !== undefined) {
      addReply.createByOwner = true;
    }
    await transaction.update(messageRef, {
      reply: info.reply !== undefined ? [addReply, ...info.reply] : [addReply],
      updateAt: FieldValue.serverTimestamp(),
    });
  });
}

const ChatModel = {
  findAllEvent,
  findAllEventWithPage,
  create,
  update,
  close,
  reopen,
  lock,
  showMsgAndCollectReply,
  publish,
  unpublish,
  post,
  updateMessageSortWeight,
  get,
  messageList,
  messageListForDownload,
  messageListWithUniqueVoter,
  messageInfo,
  closeSendMessage,
  denyMessage,
  voteMessage,
  reactionMessage,
  postReply,
  denyReply,
  deleteReply,
  updateMessage,
  pinMessage,
};

export default ChatModel;
