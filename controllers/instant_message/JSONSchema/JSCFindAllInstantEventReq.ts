import { JSONSchema6 } from 'json-schema';

const JSCFindAllInstantEventReq: JSONSchema6 = {
  additionalProperties: false,
  properties: {
    query: {
      additionalProperties: false,
      properties: {
        page: {
          type: 'number',
          minimum: 1,
        },
        size: {
          type: 'number',
          minimum: 10,
        },
      },
      required: [],
      type: 'object',
    },
  },
  required: ['query'],
  type: 'object',
};

export default JSCFindAllInstantEventReq;
