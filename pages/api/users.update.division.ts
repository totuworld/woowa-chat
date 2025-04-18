// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from 'next';

import handleError from '@/controllers/handle_error';
import updateDivisionInfo from '@/scripts/update.division_info';

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  try {
    await updateDivisionInfo();
  } catch (err) {
    console.error(err);
    handleError(err, res);
  }
}
