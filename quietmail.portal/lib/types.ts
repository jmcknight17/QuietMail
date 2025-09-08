type ScanResult = {
  domain: string;
  individualSenders: IndividualSendersDto[];
  emailCount: number;
  openedCount: number;
  openedPercent: number;
};

type IndividualSendersDto = {
    email: string;
    emailCount: number;
    openedCount: number;
    openedPercent: number;
    isMailList: boolean;
};
