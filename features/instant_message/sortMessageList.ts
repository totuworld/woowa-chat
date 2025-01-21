import { InInstantEventMessage } from '@/models/instant_message/interface/in_instant_event_message';

const sortLatest = (messageList: InInstantEventMessage[]) =>
  messageList.sort((a, b) => (a.createAt < b.createAt ? -1 : 1));

const sortMostLiked = (messageList: InInstantEventMessage[]) =>
  messageList.sort((a, b) => ((a.reaction?.length ?? 0) > (b.reaction?.length ?? 0) ? -1 : 1));

export { sortLatest, sortMostLiked };
