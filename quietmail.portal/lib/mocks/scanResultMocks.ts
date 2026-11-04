import { ScanResult } from '@/lib/types';

export const MOCK_SCAN_RESULTS: ScanResult[] = [
  {
    domain: 'newsletter.techcrunch.com',
    emailCount: 84,
    openedCount: 12,
    openedPercent: 14.29,
    individualSenders: [
      {
        email: 'daily@newsletter.techcrunch.com',
        emailCount: 60,
        openedCount: 10,
        openedPercent: 16.67,
        isMailList: true,
      },
      {
        email: 'events@newsletter.techcrunch.com',
        emailCount: 24,
        openedCount: 2,
        openedPercent: 8.33,
        isMailList: true,
      },
    ],
  },
  {
    domain: 'marketing.ubereats.com',
    emailCount: 45,
    openedCount: 0,
    openedPercent: 0,
    individualSenders: [
      {
        email: 'promos@marketing.ubereats.com',
        emailCount: 30,
        openedCount: 0,
        openedPercent: 0,
        isMailList: true,
      },
      {
        email: 'offers@marketing.ubereats.com',
        emailCount: 15,
        openedCount: 0,
        openedPercent: 0,
        isMailList: true,
      },
    ],
  },
  {
    domain: 'github.com',
    emailCount: 120,
    openedCount: 96,
    openedPercent: 80.0,
    individualSenders: [
      {
        email: 'notifications@github.com',
        emailCount: 120,
        openedCount: 96,
        openedPercent: 80.0,
        isMailList: false,
      },
    ],
  },
  {
    domain: 'updates.linkedin.com',
    emailCount: 32,
    openedCount: 4,
    openedPercent: 12.5,
    individualSenders: [
      {
        email: 'jobalerts@updates.linkedin.com',
        emailCount: 20,
        openedCount: 3,
        openedPercent: 15.0,
        isMailList: true,
      },
      {
        email: 'news@updates.linkedin.com',
        emailCount: 12,
        openedCount: 1,
        openedPercent: 8.33,
        isMailList: true,
      },
    ],
  },
  {
    domain: 'mail.spotify.com',
    emailCount: 18,
    openedCount: 18,
    openedPercent: 100.0,
    individualSenders: [
      {
        email: 'no-reply@mail.spotify.com',
        emailCount: 18,
        openedCount: 18,
        openedPercent: 100.0,
        isMailList: false,
      },
    ],
  },
];