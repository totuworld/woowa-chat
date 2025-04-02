// add_leaderts.ts의 main을 호출하는 api로 만든다.
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from 'next';

import handleError from '@/controllers/handle_error';
import main from '@/scripts/update_auth_name';

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  try {
    await main();
  } catch (err) {
    console.error(err);
    handleError(err, res);
  }
}
