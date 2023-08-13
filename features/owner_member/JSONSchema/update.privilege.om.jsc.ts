import { JSONSchema6 } from 'json-schema';

const JSCUpdateOwnerMemberPrivilegeReq: JSONSchema6 = {
  definitions: {
    InOwnerMember: {
      additionalProperties: false,
      properties: {
        privilege: {
          items: {
            type: 'number',
          },
          type: 'array',
        },
        uid: {
          type: 'string',
        },
      },
      required: ['uid', 'privilege'],
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

export default JSCUpdateOwnerMemberPrivilegeReq;
