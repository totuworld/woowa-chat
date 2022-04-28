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
        replyIdx: {
          type: 'number',
          minimum: 0,
        },
      },
      required: ['instantEventId', 'messageId', 'replyIdx'],
      type: 'object',
    },
  },
  required: ['body'],
  type: 'object',
};

export default JSCDenyInstantEventMessageReplyReq;
