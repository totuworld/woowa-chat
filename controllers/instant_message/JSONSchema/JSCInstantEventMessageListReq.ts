import { JSONSchema6 } from 'json-schema';

const JSCInstantEventMessageListReq: JSONSchema6 = {
  additionalProperties: false,
  properties: {
    query: {
      additionalProperties: false,
      properties: {
        instantEventId: {
          type: 'string',
        },
        isPreview: {
          type: 'boolean',
          default: false,
        },
      },
      required: ['instantEventId'],
      type: 'object',
    },
  },
  required: ['query'],
  type: 'object',
};

export default JSCInstantEventMessageListReq;
