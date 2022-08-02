import { JSONSchema6 } from 'json-schema';

const JSCUpdateInstantEventReq: JSONSchema6 = {
  additionalProperties: false,
  properties: {
    body: {
      additionalProperties: false,
      properties: {
        instantEventId: {
          type: 'string',
        },
        title: {
          type: 'string',
        },
        desc: {
          type: 'string',
        },
        startDate: {
          description: '질문 시작',
          type: 'string',
          format: 'date-time',
        },
        endDate: {
          description: '질문 마감',
          type: 'string',
          format: 'date-time',
        },
        titleImg: {
          type: 'string',
        },
        bgImg: {
          type: 'string',
        },
      },
      required: ['instantEventId', 'title', 'startDate', 'endDate'],
      type: 'object',
    },
  },
  required: ['body'],
  type: 'object',
};

export default JSCUpdateInstantEventReq;
