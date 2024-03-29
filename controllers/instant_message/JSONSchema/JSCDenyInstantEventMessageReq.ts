import { JSONSchema6 } from 'json-schema';

const JSCDenyInstantEventMessageReq: JSONSchema6 = {
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
        deny: {
          type: 'boolean',
          default: true,
        },
      },
      required: ['instantEventId', 'messageId'],
      type: 'object',
    },
  },
  required: ['body'],
  type: 'object',
};

export default JSCDenyInstantEventMessageReq;
