import React from "react";
import { ShieldCheck, HardDriveDownload, Zap } from "lucide-react";
import { IconBrandGithub } from "@tabler/icons-react";

export interface Pillars {
    title: string;
    description: string;
    icon: React.ElementType;
}

export const SummaryPillars = [
  {
    icon: ShieldCheck,
    title: "Direct OAuth 2.0",
    description: "Authenticates securely through official Google APIs. We never handle or see your password.",
  },
  {
    icon: HardDriveDownload,
    title: "Zero Data Storage",
    description: "Metadata processes entirely in-memory. Zero emails, tokens, or logs are stored on disk.",
  },
  {
    icon: Zap,
    title: "High-Velocity .NET",
    description: "Powered by a containerized .NET 8 Web API capable of grouping thousands of emails in seconds.",
  },
  {
    icon: IconBrandGithub,
    title: "100% Open Source",
    description: "Fully transparent MIT license code. Inspect, self-host, or contribute on GitHub.",
  },
];