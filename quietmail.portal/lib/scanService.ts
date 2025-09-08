import * as signalR from "@microsoft/signalr";
export const startScan = (
  accessToken: string,
  onProgress: (progress: number) => void,
  onComplete: (results: ScanResult[]) => void,
  onError: (error: string) => void
) => {
  const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5022/progressHub")
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

      const response = await fetch('http://localhost:5022/start-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ connectionId })
      });

      if (response.status !== 202) {
        throw new Error('Failed to start the scan on the server.');
      }
    } catch (err: any) {
      onError(err.message);
      connection.stop();
    }
  };

  startConnectionAndScan();
};