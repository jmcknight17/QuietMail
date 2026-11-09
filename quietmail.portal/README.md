# QuietMail ✉️⚡

> High-performance, open-source inbox cleaner and analytics engine built with a zero-data storage architecture.

[![MIT License](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![.NET 8.0](https://img.shields.io/badge/.NET-8.0-blue.svg)](https://dotnet.microsoft.com/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)

QuietMail connects securely to your Gmail account via Google OAuth 2.0 to scan, group, and clean low-value subscriptions and bulk emails in seconds.

---

## 🔒 Zero Data Storage Architecture

QuietMail is engineered strictly for privacy:

* **In-Memory Processing:** Email headers and metadata are scanned and grouped dynamically in memory.
* **0 Bytes Stored:** No emails, metadata, tokens, or logs are ever written to a local or remote database.
* **Direct Google OAuth:** Authentication occurs directly through official Google APIs. We never handle or see your password.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons, Tabler Icons
* **Backend:** C# / .NET 8 Web API, Google Gmail REST API, Polly resilience policies
* **Deployment:** Docker, Linux containers

---

## 🚀 Quickstart

### Option A: Local Development

#### Prerequisites
* [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
* [Node.js 18+](https://nodejs.org/)

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/jmcknight17/quietmail.git](https://github.com/jmcknight17/quietmail.git)
   cd quietmail