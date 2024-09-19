export interface PostInstantEventMessageReq {
  body: {
    instantEventId: string;
    message: string;
    title?: string;
    category?: string;
  };
}
