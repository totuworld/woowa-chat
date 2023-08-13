import { JSONSchema6 } from 'json-schema';

const JSCUpdateBodyReq: JSONSchema6 = {
  additionalProperties: false,
  properties: {
    body: {
      additionalProperties: false,
      properties: {
        instantEventId: {
          type: 'string',
        },
        messageId: {
          type: 'string',
        },
        message: {
          type: 'string',
        },
      },
      required: ['instantEventId', 'messageId', 'message'],
      type: 'object',
    },
  },
  required: ['body'],
  type: 'object',
};

export default JSCUpdateBodyReq;
