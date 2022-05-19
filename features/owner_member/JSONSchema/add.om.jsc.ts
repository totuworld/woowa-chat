import { JSONSchema6 } from 'json-schema';

const JSCAddOwnerMemberReq: JSONSchema6 = {
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
      required: ['uid', 'displayName', 'email'],
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

export default JSCAddOwnerMemberReq;
