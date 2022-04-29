import { JSONSchema6 } from 'json-schema';

const JSCUpdateInstantEventMessageSortWeightReq: JSONSchema6 = {
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
        sortWeight: {
          type: 'number',
        },
      },
      required: ['instantEventId', 'messageId', 'sortWeight'],
      type: 'object',
    },
  },
  required: ['body'],
  type: 'object',
};

export default JSCUpdateInstantEventMessageSortWeightReq;
