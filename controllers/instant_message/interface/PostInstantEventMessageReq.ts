export interface PostInstantEventMessageReq {
  body: {
    instantEventId: string;
    message: string;
    authorization: string;
  };
}
