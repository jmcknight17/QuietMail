export interface WorkflowStep {
  step: string;
  title: string;
  description: string;
  meta: string;
  detail: string;
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    step: "01",
    title: "Authenticate via Google OAuth",
    description: "Grant read-only header permissions through Google's official consent screen. We receive a short-lived token without ever seeing your password.",
    meta: "OAuth 2.0 // Token Exchange",
    detail: "Scope: gmail.readonly + gmail.modify",
  },
  {
    step: "02",
    title: "High-Velocity In-Memory Scan",
    description: "Our .NET 8 API scans thousands of message headers in seconds, grouping emails by domain and identifying List-Unsubscribe headers.",
    meta: "Engine // Parallel Async Stream",
    detail: "0 Bytes Written to Disk",
  },
  {
    step: "03",
    title: "Purge & Unsubscribe in One Click",
    description: "Select low-value domains or senders to bulk trash emails via Gmail API and automatically execute HTTP POST unsubscriptions.",
    meta: "Execution // RFC 8058",
    detail: "Immediate Inbox Cleanup",
  },
];