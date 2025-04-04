import { JSONSchema6 } from 'json-schema';

const JSCUpdateOwnerMemberReq: JSONSchema6 = {
  definitions: {
    InOwnerMember: {
      additionalProperties: false,
      properties: {
        desc: {
          type: 'string',
        },
        displayName: {
          type: 'string',
        },
        email: {
          type: 'string',
        },
        uid: {
          type: 'string',
        },
      },
      required: ['uid'],
      type: 'object',
    },
  },
  properties: {
    body: {
      $ref: '#/definitions/InOwnerMember',
    },
  },
  required: ['body'],
  type: 'object',
};

export default JSCUpdateOwnerMemberReq;
