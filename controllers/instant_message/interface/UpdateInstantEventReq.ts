export interface UpdateInstantEventReq {
  body: {
    instantEventId: string;
    title: string;
    desc?: string;
    startDate: string;
    endDate: string;
    titleImg?: string;
    bgImg?: string;
    isQnA?: boolean;
    isSecret?: boolean;
    categories?: string[]; // Added to support dynamic categories
    isAdminOnly?: boolean;
  };
}
