import moment from 'moment';
import { InInstantEvent } from '@/models/instant_message/interface/in_instant_event';

function calEventState(instantEventInfo: InInstantEvent | null) {
  if (instantEventInfo === null) {
    return 'none';
  }
  if (instantEventInfo.locked !== undefined && instantEventInfo.locked === true && instantEventInfo.closed === false) {
    // 잠긴경우
    return 'locked';
  }
  if (instantEventInfo.closed === true) {
    // 완전히 종료된 경우
    return 'closed';
  }
  const now = moment();
  const startDate = moment(instantEventInfo.startDate, moment.ISO_8601);
  const endDate = moment(instantEventInfo.endDate, moment.ISO_8601);
  // 질문 가능한 기간 내 인가?
  if (now.isBetween(startDate, endDate, undefined, '[]')) {
    return 'question';
  }
  // 질문 가능한 기간이 넘었나?
  if (now.isAfter(endDate)) {
    return 'reply';
  }
  return 'pre';
}

const EventStateTOKorText = {
  pre: '준비중',
  reply: '댓글 등록 기간',
  question: '질문 등록 기간',
  closed: '종료',
  locked: '댓글 등록 잠금',
  none: '-',
};

const InstantEventUtil = {
  calEventState,
  EventStateTOKorText,
};

export default InstantEventUtil;
