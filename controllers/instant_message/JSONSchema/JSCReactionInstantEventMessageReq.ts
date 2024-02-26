import { JSONSchema6 } from 'json-schema';

const JSCReactionInstantEventMessageReq: JSONSchema6 = {
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
        reaction: {
          properties: {
            type: {
              type: 'string',
              enum: ['LIKE', 'CARE', 'HAHA', 'WOW', 'SAD', 'ANGRY', 'DOWN'],
            },
          },
          required: ['type'],
        },
      },
      required: ['instantEventId', 'messageId', 'reaction'],
      type: 'object',
    },
  },
  required: ['body'],
  type: 'object',
};

export default JSCReactionInstantEventMessageReq;
