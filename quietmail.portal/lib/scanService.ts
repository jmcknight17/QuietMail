import * as signalR from "@microsoft/signalr";
export const startScan = (
  provider: string,
  onProgress: (progress: number) => void,
  onComplete: (results: ScanResult[]) => void,
  onError: (error: string) => void
) => {
  const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7297/progressHub", {
        withCredentials: true
    })
    .withAutomaticReconnect([0, 2000, 10000, 30000])
    .build();
  connection.on("ReceiveProgressUpdate", (progressUpdate: number) => {
    onProgress(progressUpdate);
  });

  connection.on("ScanCompleted", (results: ScanResult[]) => {
    onComplete(results);
    connection.stop();
  });

  const startConnectionAndScan = async () => {
    try {
      await connection.start();
      const connectionId = connection.connectionId;

      const response = await fetch(`https://localhost:7297/sender-analysis/${provider}/start-scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ connectionId })
      });

      if (response.status !== 202) {
        throw new Error('Failed to start the scan on the server.');
      }
      if (response.status === 202) {
        console.log('Scan started successfully on the server.');
      }
    } catch (err: any) {
      onError(err.message);
      connection.stop();
    }
  };

  startConnectionAndScan();
};