export interface CapabilityRow {
  number: string;
  title: string;
  description: string;
  iconType: "scan" | "bulk" | "analytics" | "security";
}

export const QUIETMAIL_FEATURES: CapabilityRow[] = [
  {
    number: "01",
    title: "High-Velocity In-Memory Scanning",
    description: "Scan thousands of email headers in parallel using native .NET 8 async streams. Your email content is never read or stored on disk.",
    iconType: "scan",
  },
  {
    number: "02",
    title: "One-Click Bulk Unsubscribe",
    description: "Automatically extracts RFC 8058 List-Unsubscribe headers and performs one-click HTTP POST unsubscriptions without opening your browser.",
    iconType: "bulk",
  },
  {
    number: "03",
    title: "Sender & Domain Analytics",
    description: "Get immediate clarity on open ratios and email volume grouped by domain to prune low-value subscriptions fast.",
    iconType: "analytics",
  },
  {
    number: "04",
    title: "Zero Data Architecture",
    description: "Bank-grade OAuth 2.0 direct connection. We process metadata in-memory and store 0 bytes permanently.",
    iconType: "security",
  },
];