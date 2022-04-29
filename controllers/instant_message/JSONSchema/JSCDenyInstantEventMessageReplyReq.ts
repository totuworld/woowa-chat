import { JSONSchema6 } from 'json-schema';

const JSCDenyInstantEventMessageReplyReq: JSONSchema6 = {
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
        replyId: {
          type: 'string',
        },
        deny: {
          type: 'boolean',
          default: true,
        },
      },
      required: ['instantEventId', 'messageId', 'replyId'],
      type: 'object',
    },
  },
  required: ['body'],
  type: 'object',
};

export default JSCDenyInstantEventMessageReplyReq;
