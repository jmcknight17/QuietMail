"use client";

import React from "react";
import { ScanResult } from "@/lib/types";

interface DashboardStatsProps {
  scanResult: ScanResult[];
}

export function DashboardStats({ scanResult }: DashboardStatsProps) {
  const totalEmails = scanResult.reduce((acc, domain) => acc + domain.emailCount, 0);
  
  const allSenders = scanResult.flatMap((domain) => domain.individualSenders);
  const totalSenders = allSenders.length;
  
  const totalNewsletters = allSenders.filter((s) => s.isMailList).length;
  
  const avgOpenRate = totalSenders > 0
    ? Math.round(allSenders.reduce((acc, s) => acc + s.openedPercent, 0) / totalSenders)
    : 0;

  const stats = [
    {
      title: "Total Emails",
      value: totalEmails.toLocaleString(),
      subtext: "Scanned across all domains",
    },
    {
      title: "Total Senders",
      value: totalSenders.toLocaleString(),
      subtext: "Unique inbox connections",
    },
    {
      title: "Mailing Lists",
      value: totalNewsletters.toLocaleString(),
      subtext: "Newsletters & subscriptions",
    },
    {
      title: "Avg. Open Rate",
      value: `${avgOpenRate}%`,
      subtext: "Overall engagement ratio",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl p-6 shadow-xl space-y-2"
        >
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            {stat.title}
          </p>
          <div className="text-3xl font-bold tracking-tight text-foreground">
            {stat.value}
          </div>
          <p className="text-xs text-muted-foreground/80 font-mono">
            {stat.subtext}
          </p>
        </div>
      ))}
    </div>
  );
}