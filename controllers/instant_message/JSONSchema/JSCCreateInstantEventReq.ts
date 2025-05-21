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
        createId: {
          type: 'string',
        },
        townhallType: {
          type: 'string',
          enum: ['division', 'center'],
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
        isQnA: {
          type: 'boolean',
        },
        isSecret: {
          type: 'boolean',
        },
        categories: {
          type: 'array',
          items: {
            type: 'string',
          },
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
