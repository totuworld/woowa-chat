export interface CreateInstantEventReq {
  body: {
    title: string;
    createId?: string;
    desc?: string;
    startDate: string;
    endDate: string;
    titleImg?: string;
    bgImg?: string;
    isQnA?: boolean;
    isSecret?: boolean;
    townhallType?: 'division' | 'center';
  };
}
