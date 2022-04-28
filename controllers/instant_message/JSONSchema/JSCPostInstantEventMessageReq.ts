import { JSONSchema6 } from 'json-schema';

const JSCPostInstantEventMessageReq: JSONSchema6 = {
  additionalProperties: false,
  properties: {
    body: {
      additionalProperties: false,
      properties: {
        instantEventId: {
          type: 'string',
        },
        message: {
          type: 'string',
        },
      },
      required: ['instantEventId', 'message'],
      type: 'object',
    },
  },
  required: ['body'],
  type: 'object',
};

export default JSCPostInstantEventMessageReq;
