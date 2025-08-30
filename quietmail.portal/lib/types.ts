type ScanResult = {
  domain: string;
  individualSenders: IndividualSendersDto[];
  emailCount: number;
  openedCount: number;
  openedPercent: float;
};

type IndividualSendersDto = {
    email: string;
    emailCount: number;
    openedCount: number;
    openedPercent: float;
};
