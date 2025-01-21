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
          maxLength: 5000,
        },
        authorization: {
          type: 'string',
        },
        showOnlyAdmin: {
          type: 'boolean',
        },
        category: {
          type: 'string',
        },
      },
      required: ['instantEventId', 'message', 'authorization', 'showOnlyAdmin'],
      type: 'object',
    },
  },
  required: ['body'],
  type: 'object',
};

export default JSCPostInstantEventMessageReq;
