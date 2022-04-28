import { JSONSchema6 } from 'json-schema';

const JSCVoteInstantEventMessageReq: JSONSchema6 = {
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
        isUpvote: {
          type: 'boolean',
        },
      },
      required: ['instantEventId', 'messageId', 'isUpvote'],
      type: 'object',
    },
  },
  required: ['body'],
  type: 'object',
};

export default JSCVoteInstantEventMessageReq;
