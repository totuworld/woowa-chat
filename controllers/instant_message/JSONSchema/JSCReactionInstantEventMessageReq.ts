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
            isAdd: {
              type: 'boolean',
            },
            type: {
              type: 'string',
              enum: ['LIKE', 'NEXT', 'HAHA', 'EYE', 'CHEERUP'],
            },
          },
          required: ['isAdd'],
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
