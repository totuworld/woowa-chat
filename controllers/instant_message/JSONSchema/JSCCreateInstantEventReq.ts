import { JSONSchema6 } from 'json-schema';

const JSCCreateInstantEventReq: JSONSchema6 = {
  additionalProperties: false,
  properties: {
    body: {
      additionalProperties: false,
      properties: {
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
      required: ['title', 'startDate', 'endDate'],
      type: 'object',
    },
  },
  required: ['body'],
  type: 'object',
};

export default JSCCreateInstantEventReq;
