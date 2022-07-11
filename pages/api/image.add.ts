// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';
import { nanoid } from 'nanoid';
import CustomServerError from '@/controllers/custom_error/custom_server_error';
import handleError from '@/controllers/handle_error';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb',
    },
  },
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? '',
  api_key: process.env.CLOUDINARY_API_KEY ?? '',
  api_secret: process.env.CLOUDINARY_API_SECRET ?? '',
  secure: true,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  try {
    if (method !== 'POST') {
      throw new CustomServerError({ statusCode: 400, message: '지원하지 않는 method' });
    }
    const {
      image,
      options = {
        public_id: nanoid(8),
      },
    } = req.body;
    const results = await cloudinary.uploader.upload(image, options);
    return res.status(200).json(results);
  } catch (err) {
    console.error(err);
    handleError(err, res);
  }
}
