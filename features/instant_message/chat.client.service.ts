import FirebaseAuthClient from '@/models/auth/firebase_auth_client';
import { InInstantEvent } from '@/models/instant_message/interface/in_instant_event';
import {
  InInstantEventDownloadItem,
  InInstantEventMessage,
} from '@/models/instant_message/interface/in_instant_event_message';
import { getBaseUrl } from '@/utils/get_base_url';
import { requester, Resp } from '@/utils/requester';
import { REACTION_TYPE } from './message_item/reaction_type';

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
  startDate?: string;
  endDate?: string;
  titleImg?: string;
  bgImg?: string;
}): Promise<Resp<{ instantEventId: string }>> {
  const url = '/api/instant-event.create';
  try {
    const postData = {
      title,
      desc,
      startDate,
      endDate,
      titleImg,
      bgImg,
    };
    const resp = await requester<{ instantEventId: string }>({
      option: {
        url,
        method: 'POST',
        data: postData,
      },
    });
    return resp;
  } catch (err) {
    return {
      status: 500,
    };
  }
}

async function updateInfo({
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
  startDate?: string;
  endDate?: string;
  titleImg?: string;
  bgImg?: string;
}): Promise<Resp<{ instantEventId: string }>> {
  const url = '/api/instant-event.update';
  try {
    const postData = {
      instantEventId,
      title,
      desc,
      startDate,
      endDate,
      titleImg,
      bgImg,
    };
    const resp = await requester<{ instantEventId: string }>({
      option: {
        url,
        method: 'PUT',
        data: postData,
      },
    });
    return resp;
  } catch (err) {
    return {
      status: 500,
    };
  }
}

async function get({
  instantEventId,
  isServer = false,
}: {
  instantEventId: string;
  isServer?: boolean;
}): Promise<Resp<InInstantEvent>> {
  const hostAndPort: string = getBaseUrl(isServer);
  const url = `${hostAndPort}/api/instant-event.info/${instantEventId}`;
  try {
    const resp = await requester<InInstantEvent>({
      option: {
        url,
        method: 'GET',
      },
    });
    return resp;
  } catch (err) {
    return {
      status: 500,
    };
  }
}

async function getDownloadData({
  instantEventId,
}: {
  instantEventId: string;
}): Promise<Resp<InInstantEventDownloadItem[]>> {
  const url = `/api/instant-event.messages.list.download/${instantEventId}`;
  try {
    const token = await FirebaseAuthClient.getInstance().Auth.currentUser?.getIdToken();
    const resp = await requester<InInstantEventDownloadItem[]>({
      option: {
        url,
        method: 'GET',
        headers: {
          authorization: token ?? '',
        },
      },
    });
    return resp;
  } catch (err) {
    return {
      status: 500,
    };
  }
}

async function lock({ instantEventId }: { instantEventId: string }): Promise<Resp<unknown>> {
  const url = '/api/instant-event.lock';
  try {
    const resp = await requester({
      option: {
        url,
        method: 'PUT',
        data: {
          instantEventId,
        },
      },
    });
    return resp;
  } catch (err) {
    return {
      status: 500,
    };
  }
}

async function publish({ instantEventId }: { instantEventId: string }): Promise<Resp<unknown>> {
  const url = '/api/instant-event.publish';
  try {
    const resp = await requester({
      option: {
        url,
        method: 'PUT',
        data: {
          instantEventId,
        },
      },
    });
    return resp;
  } catch (err) {
    return {
      status: 500,
    };
  }
}

async function unpublish({ instantEventId }: { instantEventId: string }): Promise<Resp<unknown>> {
  const url = '/api/instant-event.unpublish';
  try {
    const resp = await requester({
      option: {
        url,
        method: 'PUT',
        data: {
          instantEventId,
        },
      },
    });
    return resp;
  } catch (err) {
    return {
      status: 500,
    };
  }
}

async function close({ instantEventId }: { instantEventId: string }): Promise<Resp<unknown>> {
  const url = '/api/instant-event.close';
  try {
    const resp = await requester({
      option: {
        url,
        method: 'PUT',
        data: {
          instantEventId,
        },
      },
    });
    return resp;
  } catch (err) {
    return {
      status: 500,
    };
  }
}

async function reopen({ instantEventId }: { instantEventId: string }): Promise<Resp<unknown>> {
  const url = '/api/instant-event.reopen';
  try {
    const resp = await requester({
      option: {
        url,
        method: 'PUT',
        data: {
          instantEventId,
        },
      },
    });
    return resp;
  } catch (err) {
    return {
      status: 500,
    };
  }
}

async function immediateClosSendMessagePeriod({ instantEventId }: { instantEventId: string }): Promise<Resp<unknown>> {
  const url = '/api/instant-event.close-send-message';
  try {
    const resp = await requester({
      option: {
        url,
        method: 'PUT',
        data: {
          instantEventId,
        },
      },
    });
    return resp;
  } catch (err) {
    return {
      status: 500,
    };
  }
}

async function post({ instantEventId, message }: { instantEventId: string; message: string }): Promise<Resp<unknown>> {
  const url = '/api/instant-event.messages.add';
  try {
    const resp = await requester({
      option: {
        url,
        method: 'POST',
        data: {
          instantEventId,
          message,
        },
      },
    });
    return resp;
  } catch (err) {
    return {
      status: 500,
    };
  }
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
  const url = `/api/instant-event.messages.add.reply/${instantEventId}/${messageId}`;
  try {
    const sendData: {
      reply: string;
      author?: {
        displayName: string;
        photoURL?: string;
      };
    } = { reply };
    if (author !== undefined) {
      sendData.author = author;
    }
    const resp = await requester({
      option: {
        url,
        method: 'POST',
        data: sendData,
      },
    });
    return resp;
  } catch (err) {
    return {
      status: 500,
    };
  }
}

async function getMessageInfo({
  instantEventId,
  messageId,
}: {
  instantEventId: string;
  messageId: string;
}): Promise<Resp<InInstantEventMessage>> {
  const url = `/api/instant-event.messages.info/${instantEventId}/${messageId}`;
  const token = await FirebaseAuthClient.getInstance().Auth.currentUser?.getIdToken();
  try {
    const resp = await requester<InInstantEventMessage>({
      option: {
        url,
        method: 'GET',
        headers: token
          ? {
              authorization: token,
            }
          : {},
      },
    });
    return resp;
  } catch (err) {
    return {
      status: 500,
    };
  }
}

async function denyMessage({
  instantEventId,
  messageId,
  deny = true,
}: {
  instantEventId: string;
  messageId: string;
  deny?: boolean;
}): Promise<Resp<void>> {
  const url = '/api/instant-event.messages.deny';
  const token = await FirebaseAuthClient.getInstance().Auth.currentUser?.getIdToken();
  try {
    await requester<InInstantEventMessage>({
      option: {
        url,
        method: 'PUT',
        headers: {
          authorization: token ?? '',
        },
        data: { instantEventId, messageId, deny },
      },
    });
    return { status: 200 };
  } catch (err) {
    return {
      status: 500,
    };
  }
}

async function updateMessageSortWeight({
  instantEventId,
  messageId,
  sortWeight,
}: {
  instantEventId: string;
  messageId: string;
  sortWeight: number;
}): Promise<Resp<void>> {
  const url = '/api/instant-event.messages.sort_weight';
  const token = await FirebaseAuthClient.getInstance().Auth.currentUser?.getIdToken();
  try {
    await requester<InInstantEventMessage>({
      option: {
        url,
        method: 'PUT',
        headers: {
          authorization: token ?? '',
        },
        data: { instantEventId, messageId, sortWeight },
      },
    });
    return { status: 200 };
  } catch (err) {
    return {
      status: 500,
    };
  }
}

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
}): Promise<Resp<void>> {
  const url = '/api/instant-event.messages.deny_reply';
  const token = await FirebaseAuthClient.getInstance().Auth.currentUser?.getIdToken();
  try {
    await requester<InInstantEventMessage>({
      option: {
        url,
        method: 'PUT',
        headers: {
          authorization: token ?? '',
        },
        data: { instantEventId, messageId, replyId, deny },
      },
    });
    return { status: 200 };
  } catch (err) {
    return {
      status: 500,
    };
  }
}

async function voteMessageInfo({
  instantEventId,
  messageId,
  isUpvote = true,
}: {
  instantEventId: string;
  messageId: string;
  isUpvote?: boolean;
}): Promise<Resp<InInstantEventMessage>> {
  const url = '/api/instant-event.messages.vote';
  const token = await FirebaseAuthClient.getInstance().Auth.currentUser?.getIdToken();
  try {
    const resp = await requester<InInstantEventMessage>({
      option: {
        url,
        method: 'PUT',
        headers: {
          authorization: token ?? '',
        },
        data: { instantEventId, messageId, isUpvote },
      },
    });
    return resp;
  } catch (err) {
    return {
      status: 500,
    };
  }
}

async function reactionMessageInfo({
  instantEventId,
  messageId,
  reaction,
}: {
  instantEventId: string;
  messageId: string;
  reaction: { isAdd: true; type: REACTION_TYPE } | { isAdd: false };
}): Promise<Resp<InInstantEventMessage>> {
  const url = '/api/instant-event.messages.reaction';
  const token = await FirebaseAuthClient.getInstance().Auth.currentUser?.getIdToken();
  try {
    const resp = await requester<InInstantEventMessage>({
      option: {
        url,
        method: 'PUT',
        headers: {
          authorization: token ?? '',
        },
        data: { instantEventId, messageId, reaction },
      },
    });
    return resp;
  } catch (err) {
    return {
      status: 500,
    };
  }
}

const ChatClientService = {
  create,
  updateInfo,
  get,
  getDownloadData,
  immediateClosSendMessagePeriod,
  denyMessage,
  denyReply,
  publish,
  unpublish,
  lock,
  voteMessageInfo,
  reactionMessageInfo,
  close,
  reopen,
  post,
  updateMessageSortWeight,
  postReply,
  getMessageInfo,
};

export default ChatClientService;
