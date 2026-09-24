'use client';
import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { startScan } from '@/lib/scanService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Mail } from 'lucide-react';
import { ScanResult } from '@/lib/types';
import { trashEmailsFromSenders, unsubscribeFromSender } from "@/lib/emailHandlingService";
import { ScanHero } from "@/components/dashboard/scanHero";
import {DashboardHeader} from "@/components/shared/dashboardHeader";
import { ScanResultsTable } from "@/components/dashboard/scanResultsTable";

export default function Dashboard() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [scanResults, setScanResults] = useState<ScanResult[]>([]);
    const [error, setError] = useState<string>('');
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const [isTrashing, setIsTrashing] = useState<boolean>(false);

    const handleUnsubscribe = async (senderEmails: string[]) => {
        if (!senderEmails || senderEmails.length === 0) return;
        
        setIsTrashing(true);
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError('User not authenticated.');
            setIsTrashing(false);
            return;
        }
        try {
            await unsubscribeFromSender(token, senderEmails);
            setError('');
        } catch (err: any) {
            setError(`Failed to trash emails: ${err.message || 'Unknown error'}`);
        } finally {
            setIsTrashing(false);
        }
    }

    const handleStartScan = useCallback(() => {
        setIsScanning(true);
        setProgress(0);
        setError('');
        setScanResults([]);

        const provider = localStorage.getItem('provider');

        startScan(
            provider,
            (progressUpdate) => setProgress(progressUpdate),
            (results) => {
                setScanResults(results);
                setIsScanning(false);
            },
            (errorMessage) => {
                setError(errorMessage);
                setIsScanning(false);
            },
        );
    }, []);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5022";
                
                console.log({apiUrl});
                const response = await fetch(`${apiUrl}/auth/status`, {
                    method: 'GET',
                    credentials: 'include' 
                });


                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('provider', data.provider);
                    setIsAuthenticated(true);
                } else {
                    router.push('/');
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                router.push('/');
            }
        };

        checkAuthStatus();
    }, [router]);

    const handleTrashSenders = async (senderEmails: string[]) => {
        if (!senderEmails || senderEmails.length === 0) return;
        
        setIsTrashing(true);
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError('User not authenticated.');
            setIsTrashing(false);
            return;
        }

        try {
            await trashEmailsFromSenders(token, senderEmails, localStorage.getItem('provider') || '');
            setError('');
            handleStartScan();
        } catch (err: any) {
            setError(`Failed to trash emails: ${err.message || 'Unknown error'}`);
        } finally {
            setIsTrashing(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader />

            <div className="container mx-auto p-4 md:p-8 max-w-6xl">
                {error && (
                    <div className="p-4 mb-6 rounded-lg bg-destructive/10 border border-destructive/20">
                        <p className="text-destructive text-sm">Error: {error}</p>
                    </div>
                )}

                {scanResults.length === 0 ? (
                    <ScanHero 
                        isScanning={isScanning} 
                        progress={progress} 
                        onStartScan={handleStartScan} 
                    />
                ) : (
                    <Card className="border-border bg-card">
                        <CardHeader>
                            <CardTitle className="text-foreground">Email Analysis</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Perform a comprehensive scan of your inbox to analyze sender patterns and email engagement
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <Button
                                    onClick={handleStartScan}
                                    disabled={isScanning || isTrashing}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                >
                                    {isScanning ? 'Analyzing...' : 'Rescan Inbox'}
                                </Button>
                            </div>

                            {isScanning && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">Analyzing your emails...</p>
                                        <span className="text-sm font-medium text-foreground">{progress}%</span>
                                    </div>
                                    <Progress value={progress} className="h-2" />
                                </div>
                            )}

                            {/* THE MAGIC: 150 lines of table logic replaced by one component */}
                            {scanResults.length > 0 && (
                                <ScanResultsTable 
                                    scanResults={scanResults}
                                    isTrashing={isTrashing}
                                    onTrash={handleTrashSenders}
                                    onUnsubscribe={handleUnsubscribe}
                                />
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}