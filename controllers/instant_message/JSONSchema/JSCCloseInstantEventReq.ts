import { JSONSchema6 } from 'json-schema';

const JSCCloseInstantEventReq: JSONSchema6 = {
  additionalProperties: false,
  properties: {
    body: {
      additionalProperties: false,
      properties: {
        instantEventId: {
          type: 'string',
        },
      },
      required: ['instantEventId'],
      type: 'object',
    },
  },
  required: ['body'],
  type: 'object',
};

export default JSCCloseInstantEventReq;
