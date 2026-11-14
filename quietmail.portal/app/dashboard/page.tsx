'use client';
import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { startScan } from '@/lib/scanService';
import { Mail } from 'lucide-react';
import { ScanResult } from '@/lib/types';
import { trashEmailsFromSenders, unsubscribeAndTrashEmailsFromSenders } from "@/lib/emailHandlingService";
import { ScanHero } from "@/components/dashboard/scanHero";
import { DashboardHeader } from "@/components/shared/dashboardHeader";
import { ScanResultsTable } from "@/components/dashboard/scanResultsTable";
import { ActionNotification } from "@/components/shared/actionNotification";
import { useAuth } from '@/context/AuthContext';
import { DashboardStats } from "@/components/dashboard/dashboardStats";
import { MOCK_SCAN_RESULTS } from "@lib/mocks/scanResultMocks";

export interface UserProfile {
    email: string;
    pictureUrl: string;
    provider: string;
}

export interface SenderActionResult {
    email: string;
    unsubscribed: boolean;
    trashed: boolean;
    unsubscribedError?: string;
    trashedError?: string;
}

export interface BatchedSenderActionResult {
    totalEmailsTrashed: number;
    totalSendersUnsubscribed: number;
    totalSendersRequested: number;
    details: SenderActionResult[];
    hasErrors: boolean;
}

export default function Dashboard() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const { isAuthenticated, provider } = useAuth();

    const [isNotificationVisible, setIsNotificationVisible] = useState<boolean>(false);
    const [notificationMessage, setNotificationMessage] = useState<string>('');
    const [notificationDetails, setNotificationDetails] = useState<SenderActionResult[] | null>(null);

    const [isTrashing, setIsTrashing] = useState<boolean>(false);
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [scanResults, setScanResults] = useState<ScanResult[]>([]);
    const [error, setError] = useState<string>('');
    const [progress, setProgress] = useState<number>(0);
    const [scanCompleted, setScanCompleted] = useState<boolean>(false);

    const displayResults = scanCompleted ? scanResults : MOCK_SCAN_RESULTS;

    const handleStartScan = useCallback(() => {
        setIsScanning(true);
        setProgress(0);
        setError('');
        setScanResults([]);

        startScan(
            provider,
            (progressUpdate) => setProgress(progressUpdate),
            (results) => {
                setScanResults(results);
                setIsScanning(false);
                setScanCompleted(true);
            },
            (errorMessage) => {
                setError(errorMessage);
                setIsScanning(false);
            },
        );
    }, [provider]);

    const handleTrashSenders = async (senderEmails: string[]) => {
        if (!isAuthenticated) return;

        setIsTrashing(true);
        try {
            const result = await trashEmailsFromSenders(senderEmails, provider || '');
            const successfulEmails = new Set(
                result.details.filter(d => d.trashed).map(d => d.email)
            );

            setScanResults(prevResults => {
                return prevResults.map(domainResult => {
                    const remainingSenders = domainResult.individualSenders.filter(
                        sender => !successfulEmails.has(sender.email)
                    );
                    return {
                        ...domainResult,
                        individualSenders: remainingSenders
                    };
                }).filter(domainResult => domainResult.individualSenders.length > 0);
            });

            setNotificationDetails(result.details);
            setNotificationMessage(`Successfully trashed ${result.totalEmailsTrashed} emails!`);
            setIsNotificationVisible(true);
            setError('');
        } catch (err: any) {
            setError(`Failed to trash emails: ${err.message || 'Unknown error'}`);
        } finally {
            setIsTrashing(false);
        }
    };

    const buildNotificationMessage = (result: BatchedSenderActionResult): string => {
        const successfulEmails = new Set(
            result.details.filter(d => d.trashed).map(d => d.email)
        );
        const successfulUnsubscribes = new Set(
            result.details.filter(d => d.unsubscribed && !d.unsubscribedError).map(d => d.email)
        );
        const failedUnsubscribes = new Set(
            result.details.filter(d => !d.unsubscribed && d.unsubscribedError).map(d => d.email)
        );

        const messageParts = [];

        if (successfulEmails.size > 0) {
            messageParts.push(`Successfully trashed ${result.totalEmailsTrashed} email${result.totalEmailsTrashed > 1 ? 's' : ''}`);
        } else {
            messageParts.push(`Failed to trash emails`);
        }

        if (successfulUnsubscribes.size > 0) {
            messageParts.push(`Unsubscribed from ${successfulUnsubscribes.size} sender${successfulUnsubscribes.size > 1 ? 's' : ''}`);
        } else if (failedUnsubscribes.size > 0) {
            messageParts.push(`Failed to unsubscribe from senders`);
        }

        if (messageParts.length === 1) {
            return messageParts.toString();
        }
        return messageParts.join(' - ');
    }

    const handleUnsubscribeAndTrash = async (senderEmails: string[]) => {
        if (!isAuthenticated) return;

        setIsTrashing(true);
        try {
            var result = await unsubscribeAndTrashEmailsFromSenders(senderEmails, provider || '');

            const notificationMsg = buildNotificationMessage(result);

            const successfulEmails = new Set(
                result.details.filter(d => d.trashed).map(d => d.email)
            );

            setScanResults(prevResults => {
                return prevResults.map(domainResult => {
                    const remainingSenders = domainResult.individualSenders.filter(
                        sender => !successfulEmails.has(sender.email)
                    );
                    return {
                        ...domainResult,
                        individualSenders: remainingSenders
                    };
                }).filter(domainResult => domainResult.individualSenders.length > 0);
            });
            setNotificationMessage(notificationMsg);
            setNotificationDetails(result.details);
            setIsNotificationVisible(true);
            setError('');
        }
        catch (err: any) {
            setError(`Failed to unsubscribe and trash emails: ${err.message || 'Unknown error'}`);
        }
        finally {
            setIsTrashing(false);
        }
    }

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
        <div className="min-h-screen bg-background relative pb-24">
            <DashboardHeader />

            <div className="container mx-auto p-4 md:p-8 max-w-6xl">
                {error && (
                    <div className="p-4 mb-6 rounded-lg bg-destructive/10 border border-destructive/20">
                        <p className="text-destructive text-sm">Error: {error}</p>
                    </div>
                )}

                <ScanHero isScanning={isScanning} onStartScan={handleStartScan} progress={progress} />

                <div className="relative mt-8">
                    {!scanCompleted && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/20 p-6 rounded-2xl">
                            <div className="max-w-sm p-6 rounded-2xl border border-border/80 bg-card shadow-2xl text-center space-y-3">
                                <h3 className="font-semibold text-lg text-foreground">Inbox Data Locked</h3>
                                <p className="text-xs text-muted-foreground">
                                    Perform an in-memory deep scan above to analyze sender engagement and unlock interactive cleanup tools.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className={`space-y-6 transition-all duration-500 ${!scanCompleted ? "filter blur-[2px] pointer-events-none select-none opacity-80" : ""}`}>
                        <DashboardStats scanResult={displayResults} />

                        <ScanResultsTable isNotificationVisible={isNotificationVisible} isTrashing={isTrashing} onTrash={handleTrashSenders} onUnsubscribeAndTrash={handleUnsubscribeAndTrash} scanResults={displayResults} />
                    </div>
                </div>
            </div>

            <ActionNotification isVisible={isNotificationVisible} message={notificationMessage} notificationDetails={notificationDetails} onClose={() => setIsNotificationVisible(false)} />
        </div>
    );
}