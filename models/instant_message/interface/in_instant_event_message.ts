import { firestore } from 'firebase-admin';
import { REACTION_TYPE } from '@/features/instant_message/message_item/reaction_type';

export interface InInstantEventMessageBase {
  id: string;
  message: string;
  vote: number;
  voter?: string[];
  reaction?: { type: REACTION_TYPE; voter: string }[];
  deny?: boolean;
  sortWeight: number;
  reply: InInstantEventMessageReply[];
}

export interface InInstantEventMessage extends InInstantEventMessageBase {
  voted: boolean;
  createAt: string;
  updateAt?: string;
}

export interface InInstantEventMessageServer extends InInstantEventMessageBase {
  createAt: firestore.Timestamp;
  updateAt?: firestore.Timestamp;
}

export interface InInstantEventMessageReply {
  /** reply 고유 id */
  id: string;
  reply: string;
  createAt: string;
  deny?: boolean;
  author?: {
    displayName: string;
    photoURL?: string;
  };
}

export interface InInstantEventDownloadItem {
  reply: string;
  replyAt: string;
  id: string;
  message: string;
  vote: number;
  createAt: string;
  LIKE: number;
  NEXT: number;
  HAHA: number;
  EYE: number;
  CHEERUP: number;
}
