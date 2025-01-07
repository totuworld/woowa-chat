import { JSONSchema6 } from 'json-schema';

const JSCAddLeaderMemberReq: JSONSchema6 = {
  type: 'object',
  required: ['body'],
  properties: {
    body: {
      type: 'object',
      required: ['email'],
      properties: {
        email: {
          type: 'string',
        },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
};

export default JSCAddLeaderMemberReq;
