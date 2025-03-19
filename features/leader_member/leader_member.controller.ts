import { NextApiRequest, NextApiResponse } from 'next';
import CustomServerError from '@/controllers/custom_error/custom_server_error';
import validateParamWithData from '@/controllers/req_validator';
import JSCAddLeaderMemberReq from './JSONScheme/add.lm.jsc';
import LeaderMemberModel from './leader_member.model';
import verifyFirebaseIdToken from '@/controllers/verify_firebase_id_token';

async function list(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization;
  if (token === undefined) {
    throw new CustomServerError({ statusCode: 401, message: '인증이 필요합니다' });
  }
  const senderUid: string = await verifyFirebaseIdToken(token);
  const memberList = await LeaderMemberModel.list(senderUid);
  res.status(200).json(memberList);
}

async function add(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization;
  if (token === undefined) {
    throw new CustomServerError({ statusCode: 401, message: '인증이 필요합니다' });
  }

  console.log(token);
  const senderUid: string = await verifyFirebaseIdToken(token);
  const validateResp = validateParamWithData<{
    body: {
      email: string;
    };
  }>({ body: req.body }, JSCAddLeaderMemberReq);
  if (validateResp.result === false) {
    throw new CustomServerError({ statusCode: 400, message: validateResp.errorMessage });
  }
  await LeaderMemberModel.add(validateResp.data.body.email, senderUid);
  res.status(201).end();
}

async function remove(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization;
  if (token === undefined) {
    throw new CustomServerError({ statusCode: 401, message: '인증이 필요합니다' });
  }
  const senderUid: string = await verifyFirebaseIdToken(token);
  const validateResp = validateParamWithData<{
    body: {
      email: string;
    };
  }>({ body: req.body }, JSCAddLeaderMemberReq);
  if (validateResp.result === false) {
    throw new CustomServerError({ statusCode: 400, message: validateResp.errorMessage });
  }
  await LeaderMemberModel.remove(validateResp.data.body.email, senderUid);
  res.status(204).end();
}

const LeaderMemberCtrl = {
  list,
  add,
  remove,
};

export default LeaderMemberCtrl;
