export type ScanResult = {
  domain: string;
  individualSenders: IndividualSendersDto[];
  emailCount: number;
  openedCount: number;
  openedPercent: number;
};

export type IndividualSendersDto = {
    email: string;
    emailCount: number;
    openedCount: number;
    openedPercent: number;
    isMailList: boolean;
};
