#!/bin/bash

# Trap Ctrl+C (SIGINT) to kill all background processes cleanly
trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT

echo "🚀 Starting .NET API..."
dotnet run --project ./QuietMail.Api/QuietMail.Api.csproj &

echo "⚛️ Starting React Portal..."
(cd ../QuietMail.Portal && npm run dev) &

# Keep the script open and stream logs from both
wait