import { ScanResult } from '@/lib/types';

export const MOCK_SCAN_RESULTS: ScanResult[] = [
  {
    domain: "newsletter.techcrunch.com",
    emailCount: 84,
    openedCount: 12,
    openedPercent: 14.3,
    individualSenders: [
      { email: "daily@newsletter.techcrunch.com", emailCount: 50, openedCount: 5, openedPercent: 10.0, isMailList: true },
      { email: "alerts@newsletter.techcrunch.com", emailCount: 34, openedCount: 7, openedPercent: 20.6, isMailList: false },
    ],
  },
  {
    domain: "marketing.ubereats.com",
    emailCount: 45,
    openedCount: 0,
    openedPercent: 0.0,
    individualSenders: [
      { email: "promos@marketing.ubereats.com", emailCount: 45, openedCount: 0, openedPercent: 0.0, isMailList: true },
    ],
  },
  {
    domain: "github.com",
    emailCount: 120,
    openedCount: 96,
    openedPercent: 80.0,
    individualSenders: [
      { email: "notifications@github.com", emailCount: 120, openedCount: 96, openedPercent: 80.0, isMailList: false },
    ],
  },
  {
    domain: "updates.linkedin.com",
    emailCount: 32,
    openedCount: 4,
    openedPercent: 12.5,
    individualSenders: [
      { email: "news@updates.linkedin.com", emailCount: 32, openedCount: 4, openedPercent: 12.5, isMailList: true },
    ],
  },
];