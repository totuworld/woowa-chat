import { NextApiRequest, NextApiResponse } from 'next';
import CustomServerError from '@/controllers/custom_error/custom_server_error';
import verifyFirebaseIdToken from '@/controllers/verify_firebase_id_token';
import validateParamWithData from '@/controllers/req_validator';
import { InOwnerMember } from './model/in_owner_member';
import OwnerMemberModel from './model/owner_member.model';
import BadReqError from '@/controllers/custom_error/bad_req_error';
import JSCAddOwnerMemberReq from './JSONSchema/add.om.jsc';
import JSCUpdateOwnerMemberReq from './JSONSchema/update.om.jsc';
import JSCRemoveOwnerMemberReq from './JSONSchema/remove.om.jsc';
import JSCUpdateOwnerMemberPrivilegeReq from './JSONSchema/update.privilege.om.jsc';

async function list(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization;
  if (token === undefined) {
    throw new CustomServerError({ statusCode: 401, message: '인증이 필요합니다' });
  }
  const senderUid: string = await verifyFirebaseIdToken(token);
  const memberList = await OwnerMemberModel.list({ reqUid: senderUid });
  res.status(200).json(memberList);
}

async function add(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization;
  if (token === undefined) {
    throw new CustomServerError({ statusCode: 401, message: '인증이 필요합니다' });
  }
  const senderUid: string = await verifyFirebaseIdToken(token);
  const validateResp = validateParamWithData<{ body: InOwnerMember }>(
    {
      body: req.body,
    },
    JSCAddOwnerMemberReq,
  );
  if (validateResp.result === false) {
    throw new BadReqError(validateResp.errorMessage);
  }
  await OwnerMemberModel.add({ newbie: validateResp.data.body, reqUid: senderUid });
  res.status(201).end();
}

async function update(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization;
  if (token === undefined) {
    throw new CustomServerError({ statusCode: 401, message: '인증이 필요합니다' });
  }
  const senderUid: string = await verifyFirebaseIdToken(token);
  const validateResp = validateParamWithData<{
    body: {
      uid: string;
      displayName?: string;
      desc?: string;
    };
  }>(
    {
      body: req.body,
    },
    JSCUpdateOwnerMemberReq,
  );
  if (validateResp.result === false) {
    throw new BadReqError(validateResp.errorMessage);
  }
  await OwnerMemberModel.update({ ...validateResp.data.body, reqUid: senderUid });
  res.status(200).end();
}

async function remove(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization;
  if (token === undefined) {
    throw new CustomServerError({ statusCode: 401, message: '인증이 필요합니다' });
  }
  const senderUid: string = await verifyFirebaseIdToken(token);
  const validateResp = validateParamWithData<{
    query: {
      uid: string;
    };
  }>(
    {
      query: req.query,
    },
    JSCRemoveOwnerMemberReq,
  );
  if (validateResp.result === false) {
    throw new BadReqError(validateResp.errorMessage);
  }
  await OwnerMemberModel.remove({ ...validateResp.data.query, reqUid: senderUid });
  res.status(200).end();
}

async function isOwnerMember(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization;
  if (token === undefined) {
    throw new CustomServerError({ statusCode: 401, message: '인증이 필요합니다' });
  }
  const senderUid: string = await verifyFirebaseIdToken(token);
  const info = await OwnerMemberModel.find({ uid: senderUid });
  res.status(200).json({ result: true, info });
}

async function updatePrivilege(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization;
  if (token === undefined) {
    throw new CustomServerError({ statusCode: 401, message: '인증이 필요합니다' });
  }
  const senderUid: string = await verifyFirebaseIdToken(token);
  const validateResp = validateParamWithData<{
    body: {
      uid: string;
      privilege: number[];
    };
  }>(
    {
      body: req.body,
    },
    JSCUpdateOwnerMemberPrivilegeReq,
  );
  if (validateResp.result === false) {
    throw new BadReqError(validateResp.errorMessage);
  }
  await OwnerMemberModel.updatePrivilege({ ...validateResp.data.body, reqUid: senderUid });
  res.status(200).end();
}

const OwnerMemberCtrl = { add, list, update, remove, isOwnerMember, updatePrivilege };

export default OwnerMemberCtrl;
