import { NextApiRequest, NextApiResponse } from 'next';
import { CreateInstantEventReq } from '@/controllers/instant_message/interface/CreateInstantEventReq';
import validateParamWithData from '@/controllers/req_validator';
import JSCCreateInstantEventReq from '@/controllers/instant_message/JSONSchema/JSCCreateInstantEventReq';
import BadReqError from '@/controllers/custom_error/bad_req_error';
import ChatModel from './chat.model';
import JSCFindAllInstantEventReq from '@/controllers/instant_message/JSONSchema/JSCFindAllInstantEventReq';
import { GetInstantEventReq } from '@/controllers/instant_message/interface/GetInstantEventReq';
import JSCGetInstantEventReq from '@/controllers/instant_message/JSONSchema/JSCGetInstantEventReq';
import JSCCloseInstantEventReq from '@/controllers/instant_message/JSONSchema/JSCCloseInstantEventReq';
import { PostInstantEventMessageReq } from '@/controllers/instant_message/interface/PostInstantEventMessageReq';
import JSCPostInstantEventMessageReq from '@/controllers/instant_message/JSONSchema/JSCPostInstantEventMessageReq';
import verifyFirebaseIdToken from '@/controllers/verify_firebase_id_token';
import JSCInstantEventMessageListReq from '@/controllers/instant_message/JSONSchema/JSCInstantEventMessageListReq';
import JSCInstantEventMessageInfoReq from '@/controllers/instant_message/JSONSchema/JSCInstantEventMessageInfoReq';
import checkEmptyToken from '@/controllers/check_empty_token';
import JSCDenyInstantEventMessageReq from '@/controllers/instant_message/JSONSchema/JSCDenyInstantEventMessageReq';
import JSCVoteInstantEventMessageReq from '@/controllers/instant_message/JSONSchema/JSCVoteInstantEventMessageReq';
import JSCPostInstantEventMessageReplyReq from '@/controllers/instant_message/JSONSchema/JSCPostInstantEventMessageReplyReq';
import JSCDenyInstantEventMessageReplyReq from '@/controllers/instant_message/JSONSchema/JSCDenyInstantEventMessageReplyReq';

async function create(req: NextApiRequest, res: NextApiResponse) {
  const validateResp = validateParamWithData<CreateInstantEventReq>(
    {
      body: req.body,
    },
    JSCCreateInstantEventReq,
  );
  if (validateResp.result === false) {
    throw new BadReqError(validateResp.errorMessage);
  }

  // TODO: header에서 authorization 확인해서 없으면 잘못된 요청
  // TODO: authorization에서 uid 알아내서 관리자 항목에 있는지 비교해야함.

  const { title, desc, startDate, endDate } = validateResp.data.body;
  await ChatModel.create({ title, desc, startDate, endDate });
  return res.status(201).end();
}

async function findAllEvent(req: NextApiRequest, res: NextApiResponse) {
  const validateResp = validateParamWithData<{ query: { page: number; size: number } }>(
    {
      query: req.query,
    },
    JSCFindAllInstantEventReq,
  );
  if (validateResp.result === false) {
    throw new BadReqError(validateResp.errorMessage);
  }
  // TODO: page와 size를 넘겨서 paging 해야한다.
  const instantEventInfo = await ChatModel.findAllEvent();
  return res.status(200).json(instantEventInfo);
}

async function get(req: NextApiRequest, res: NextApiResponse) {
  const validateResp = validateParamWithData<GetInstantEventReq>(
    {
      query: req.query,
    },
    JSCGetInstantEventReq,
  );
  if (validateResp.result === false) {
    throw new BadReqError(validateResp.errorMessage);
  }
  const { instantEventId } = validateResp.data.query;
  const instantEventInfo = await ChatModel.get({ instantEventId });
  return res.status(200).json(instantEventInfo);
}

async function lock(req: NextApiRequest, res: NextApiResponse) {
  const validateResp = validateParamWithData<{ body: { instantEventId: string } }>(
    {
      body: req.body,
    },
    JSCCloseInstantEventReq,
  );
  if (validateResp.result === false) {
    throw new BadReqError(validateResp.errorMessage);
  }
  const { instantEventId } = validateResp.data.body;
  await ChatModel.lock({ instantEventId });
  return res.status(200).end();
}

async function close(req: NextApiRequest, res: NextApiResponse) {
  const validateResp = validateParamWithData<{ body: { instantEventId: string } }>(
    {
      body: req.body,
    },
    JSCCloseInstantEventReq,
  );
  if (validateResp.result === false) {
    throw new BadReqError(validateResp.errorMessage);
  }
  const { instantEventId } = validateResp.data.body;
  await ChatModel.close({ instantEventId });
  return res.status(200).end();
}

async function closeSendMessage(req: NextApiRequest, res: NextApiResponse) {
  const validateResp = validateParamWithData<{ body: { instantEventId: string } }>(
    {
      body: req.body,
    },
    JSCCloseInstantEventReq,
  );
  if (validateResp.result === false) {
    throw new BadReqError(validateResp.errorMessage);
  }
  const { instantEventId } = validateResp.data.body;
  await ChatModel.closeSendMessage({ instantEventId });
  return res.status(200).end();
}

async function post(req: NextApiRequest, res: NextApiResponse) {
  const validateResp = validateParamWithData<PostInstantEventMessageReq>(
    {
      body: req.body,
    },
    JSCPostInstantEventMessageReq,
  );
  if (validateResp.result === false) {
    throw new BadReqError(validateResp.errorMessage);
  }
  await ChatModel.post({ ...validateResp.data.body });
  return res.status(201).end();
}

async function messageList(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization;
  let senderUid: string | undefined;
  if (token !== undefined) {
    senderUid = await verifyFirebaseIdToken(token);
  }
  const validateResp = validateParamWithData<{
    query: {
      instantEventId: string;
    };
  }>(
    {
      query: req.query,
    },
    JSCInstantEventMessageListReq,
  );
  if (validateResp.result === false) {
    throw new BadReqError(validateResp.errorMessage);
  }
  const result = await ChatModel.messageList({ ...validateResp.data.query, currentUserUid: senderUid });
  return res.status(200).json(result);
}

async function getMessageInfo(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization;
  let senderUid: string | undefined;
  if (token !== undefined) {
    senderUid = await verifyFirebaseIdToken(token);
  }
  const validateResp = validateParamWithData<{
    query: {
      instantEventId: string;
      messageId: string;
    };
  }>(
    {
      query: req.query,
    },
    JSCInstantEventMessageInfoReq,
  );
  if (validateResp.result === false) {
    throw new BadReqError(validateResp.errorMessage);
  }
  const result = await ChatModel.messageInfo({ ...validateResp.data.query, currentUserUid: senderUid });
  return res.status(200).json(result);
}

async function denyMessage(req: NextApiRequest, res: NextApiResponse) {
  const token = checkEmptyToken(req.headers.authorization);
  const uid = await verifyFirebaseIdToken(token);
  const validateResp = validateParamWithData<{
    body: {
      instantEventId: string;
      messageId: string;
    };
  }>(
    {
      body: req.body,
    },
    JSCDenyInstantEventMessageReq,
  );
  if (validateResp.result === false) {
    throw new BadReqError(validateResp.errorMessage);
  }
  //TODO: 관리자가 아니면 deny 못하게 한다.
  console.info(uid);
  const result = await ChatModel.denyMessage({ ...validateResp.data.body });
  return res.status(200).json(result);
}

async function denyReply(req: NextApiRequest, res: NextApiResponse) {
  const token = checkEmptyToken(req.headers.authorization);
  const uid = await verifyFirebaseIdToken(token);
  const validateResp = validateParamWithData<{
    body: {
      instantEventId: string;
      messageId: string;
      replyId: string;
    };
  }>(
    {
      body: req.body,
    },
    JSCDenyInstantEventMessageReplyReq,
  );
  if (validateResp.result === false) {
    throw new BadReqError(validateResp.errorMessage);
  }
  //TODO: 관리자가 아니면 deny 못하게 한다.
  console.info(uid);
  const result = await ChatModel.denyReply({ ...validateResp.data.body });
  return res.status(200).json(result);
}

async function voteMessage(req: NextApiRequest, res: NextApiResponse) {
  const token = checkEmptyToken(req.headers.authorization);
  const senderUid = await verifyFirebaseIdToken(token);
  const validateResp = validateParamWithData<{
    body: {
      instantEventId: string;
      messageId: string;
      isUpvote: boolean;
    };
  }>(
    {
      body: req.body,
    },
    JSCVoteInstantEventMessageReq,
  );
  if (validateResp.result === false) {
    throw new BadReqError(validateResp.errorMessage);
  }
  await ChatModel.voteMessage({ ...validateResp.data.body, voter: senderUid });
  return res.status(200).end();
}

async function postReply(req: NextApiRequest, res: NextApiResponse) {
  const validateResp = validateParamWithData<{
    query: {
      instantEventId: string;
      messageId: string;
    };
    body: {
      reply: string;
      author?: {
        displayName: string;
        photoURL?: string;
      };
    };
  }>(
    {
      query: req.query,
      body: req.body,
    },
    JSCPostInstantEventMessageReplyReq,
  );
  if (validateResp.result === false) {
    throw new BadReqError(validateResp.errorMessage);
  }
  await ChatModel.postReply({ ...validateResp.data.query, ...validateResp.data.body });
  return res.status(200).end();
}

const ChatCtrl = {
  findAllEvent,
  create,
  get,
  lock,
  close,
  post,
  closeSendMessage,
  messageList,
  getMessageInfo,
  denyMessage,
  denyReply,
  voteMessage,
  postReply,
};

export default ChatCtrl;
