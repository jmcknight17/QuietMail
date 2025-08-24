'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [emailCount, setEmailCount] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState([]);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const accessTokenFromUrl = searchParams.get('accessToken');
    const emailCountFromUrl = searchParams.get('emailCount');

    if (accessTokenFromUrl && emailCountFromUrl) {
      localStorage.setItem('accessToken', accessTokenFromUrl);
      localStorage.setItem('emailCount', emailCountFromUrl);
      router.replace('/dashboard', { scroll: false });
    }

    const token = localStorage.getItem('accessToken');
    const count = localStorage.getItem('emailCount');

    if (token && count) {
      setIsAuthenticated(true);
      setEmailCount(count);
    } else {
      router.push('/');
    }
  }, [router, searchParams]);

  const handleStartScan = async () => {
    setIsScanning(true);
    setError('');
    setScanResults([]);
    const token = localStorage.getItem('accessToken');

    try {
      const response = await fetch('http://localhost:5022/gmail', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('The scan failed. Please try again later.');
      }

      const data = await response.json();
      setScanResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsScanning(false);
    }
  };

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Dashboard</CardTitle>
          <CardDescription>
            Your inbox has a total of **{emailCount || '...'}** emails.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sender Analysis</CardTitle>
          <CardDescription>
            Click the button below to perform a deep scan of your inbox. This may take several minutes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Button onClick={handleStartScan} disabled={isScanning}>
              {isScanning ? 'Scanning...' : 'Start Full Scan'}
            </Button>
          </div>

          {isScanning && (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">Please wait, analyzing your emails...</p>
              <Progress value={undefined} />
            </div>
          )}

          {error && <p className="text-red-500 mt-4">Error: {error}</p>}

          {scanResults.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sender</TableHead>
                  <TableHead>Total Emails</TableHead>
                  <TableHead>Opened Emails</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scanResults.map((result) => (
                  <TableRow key={result.sender}>
                    <TableCell className="font-medium">{result.sender}</TableCell>
                    <TableCell>{result.totalEmails}</TableCell>
                    <TableCell>{result.openedEmails}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}