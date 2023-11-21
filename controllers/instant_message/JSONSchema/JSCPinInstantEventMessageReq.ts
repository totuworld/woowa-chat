import { JSONSchema6 } from 'json-schema';

const JSCPinInstantEventMessageReq: JSONSchema6 = {
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
      },
      required: ['instantEventId', 'messageId'],
      type: 'object',
    },
  },
  required: ['body'],
  type: 'object',
};

export default JSCPinInstantEventMessageReq;
