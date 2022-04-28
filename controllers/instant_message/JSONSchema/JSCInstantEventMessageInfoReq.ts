import { JSONSchema6 } from 'json-schema';

const JSCInstantEventMessageInfoReq: JSONSchema6 = {
  additionalProperties: false,
  properties: {
    query: {
      additionalProperties: false,
      properties: {
        instantEventId: {
          type: 'string',
        },
        messageId: {
          type: 'string',
        },
      },
      required: ['instantEventId', 'messageId'],
      type: 'object',
    },
  },
  required: ['query'],
  type: 'object',
};

export default JSCInstantEventMessageInfoReq;
