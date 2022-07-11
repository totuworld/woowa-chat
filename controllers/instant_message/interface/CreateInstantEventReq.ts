export interface CreateInstantEventReq {
  body: {
    title: string;
    desc?: string;
    startDate: string;
    endDate: string;
    titleImg?: string;
    bgImg?: string;
  };
}
