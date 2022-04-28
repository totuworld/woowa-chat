import { JSONSchema6 } from 'json-schema';

const JSCGetInstantEventReq: JSONSchema6 = {
  additionalProperties: false,
  properties: {
    query: {
      additionalProperties: false,
      properties: {
        instantEventId: {
          type: 'string',
        },
      },
      required: ['instantEventId'],
      type: 'object',
    },
  },
  required: ['query'],
  type: 'object',
};

export default JSCGetInstantEventReq;
