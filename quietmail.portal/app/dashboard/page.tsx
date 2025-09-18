'use client';
import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { startScan } from '@/lib/scanService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {Trash2, Mail, BarChart3, ChevronDown, Pizza} from 'lucide-react';
import { ScanResult, SenderDetail } from '@/lib/types';
import { trashEmailsFromSenders } from "@/lib/emailHandlingService";

export default function Dashboard() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [scanResults, setScanResults] = useState<ScanResult[]>([]);
    const [error, setError] = useState<string>('');
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [isTrashing, setIsTrashing] = useState<boolean>(false);

    const [selectedIndividualSenders, setSelectedIndividualSenders] = useState<Set<string>>(new Set());


    const handleStartScan = useCallback(() => {
        setIsScanning(true);
        setProgress(0);
        setError('');
        setScanResults([]);
        setExpandedRows(new Set());
        setSelectedIndividualSenders(new Set());
        const token = localStorage.getItem('accessToken');

        startScan(
            token,
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
        const accessTokenFromUrl = searchParams.get('accessToken');

        if (accessTokenFromUrl) {
            localStorage.setItem('accessToken', accessTokenFromUrl);

            setIsAuthenticated(true);

            router.replace('/dashboard', { scroll: false });
            handleStartScan();

        } else {
            const tokenFromStorage = localStorage.getItem('accessToken');
            const countFromStorage = localStorage.getItem('emailCount');

            if (tokenFromStorage) {
                setIsAuthenticated(true);


                if (!isScanning && scanResults.length === 0) {
                    handleStartScan();
                }
            } else {
                router.push('/');
            }
        }
    }, [router, searchParams, isScanning, scanResults.length, handleStartScan]);

    const handleTrashSenders = async (senderEmails: string[]) => {
        if (!senderEmails || senderEmails.length === 0) {
            return;
        }
        setIsTrashing(true);
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError('User not authenticated.');
            setIsTrashing(false);
            return;
        }

        try {
            await trashEmailsFromSenders(token, senderEmails);
            setError('');
            handleStartScan();
        } catch (err: any) {
            setError(`Failed to trash emails: ${err.message || 'Unknown error'}`);
        } finally {
            setIsTrashing(false);
        }
    };

    const handleRowToggle = (domain: string) => {
        const newExpandedRows = new Set(expandedRows);
        if (newExpandedRows.has(domain)) {
            newExpandedRows.delete(domain);
        } else {
            newExpandedRows.add(domain);
        }
        setExpandedRows(newExpandedRows);
    };

    const handleDomainSelect = (domain: string, isSelected: boolean) => {
        const newSelectedIndividualSenders = new Set(selectedIndividualSenders);
        const domainResult = scanResults.find(r => r.domain === domain);

        if (domainResult) {
            domainResult.individualSenders.forEach(sender => {
                if (isSelected) {
                    newSelectedIndividualSenders.add(sender.email);
                } else {
                    newSelectedIndividualSenders.delete(sender.email);
                }
            });
        }
        setSelectedIndividualSenders(newSelectedIndividualSenders);
    };

    const handleSelectAllDomains = (isSelected: boolean) => {
        const newSelectedIndividualSenders = new Set<string>();
        if (isSelected) {
            scanResults.forEach(result => {
                result.individualSenders.forEach(sender => {
                    newSelectedIndividualSenders.add(sender.email);
                });
            });
        }
        setSelectedIndividualSenders(newSelectedIndividualSenders);
    };

    const handleIndividualSenderSelect = (senderEmail: string, isSelected: boolean) => {
        const newSelectedSenders = new Set(selectedIndividualSenders);
        if (isSelected) {
            newSelectedSenders.add(senderEmail);
        } else {
            newSelectedSenders.delete(senderEmail);
        }
        setSelectedIndividualSenders(newSelectedSenders);
    };

    const areAllSendersInDomainSelected = (domain: string): boolean => {
        const domainResult = scanResults.find(r => r.domain === domain);
        if (!domainResult || domainResult.individualSenders.length === 0) {
            return false;
        }
        return domainResult.individualSenders.every(sender =>
            selectedIndividualSenders.has(sender.email)
        );
    };

    const isSelectAllDomainsChecked = scanResults.length > 0 && scanResults.every(result => areAllSendersInDomainSelected(result.domain));


    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card/50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-2">
                        <Mail className="h-6 w-6 text-primary" />
                        <h1 className="text-xl font-semibold text-foreground">EmailAnalyzer Dashboard</h1>
                    </div>
                </div>
            </header>

            <div className="container mx-auto p-4 md:p-8 max-w-6xl">
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
                                {isScanning ? 'Analyzing...' : 'Start Email Analysis'}
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

                        {error && (
                            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                                <p className="text-destructive text-sm">Error: {error}</p>
                            </div>
                        )}

                        {scanResults.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="select-all-domains"
                                                checked={isSelectAllDomainsChecked}
                                                onCheckedChange={handleSelectAllDomains}
                                                disabled={isTrashing}
                                            />
                                            <label htmlFor="select-all-domains" className="text-sm text-muted-foreground">
                                                Select All Senders ({scanResults.reduce((acc, curr) => acc + curr.individualSenders.length, 0)})
                                            </label>
                                        </div>
                                        {selectedIndividualSenders.size > 0 && (
                                            <span className="text-sm text-foreground">
                                                {selectedIndividualSenders.size} Senders Selected
                                            </span>
                                        )}
                                    </div>

                                    {selectedIndividualSenders.size > 0 && (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleTrashSenders(Array.from(selectedIndividualSenders))}
                                            disabled={isTrashing}
                                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            {isTrashing ? 'Trashing...' : `Trash Selected Senders (${selectedIndividualSenders.size})`}
                                        </Button>
                                    )}
                                </div>

                                <div className="rounded-lg border border-border overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/50">
                                                <TableHead className="w-12">
                                                    <span className="sr-only">Toggle</span>
                                                </TableHead>
                                                <TableHead className="w-12">
                                                    <span className="sr-only">Select</span>
                                                </TableHead>
                                                <TableHead className="text-foreground font-semibold">Sender Domain</TableHead>
                                                <TableHead className="text-foreground font-semibold">Total Emails</TableHead>
                                                <TableHead className="text-foreground font-semibold">Opened Emails</TableHead>
                                                <TableHead className="text-foreground font-semibold w-24 text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {scanResults.map((result) => (
                                                <React.Fragment key={result.domain}>
                                                    <TableRow className="bg-card hover:bg-accent/50 transition-colors">
                                                        <TableCell className="w-12 text-center pr-0">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRowToggle(result.domain);
                                                                }}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <ChevronDown
                                                                    className={`h-4 w-4 transition-transform ${expandedRows.has(result.domain) ? 'rotate-180' : ''}`}
                                                                />
                                                                <span className="sr-only">Toggle {result.domain} details</span>
                                                            </Button>
                                                        </TableCell>
                                                        <TableCell className="w-12">
                                                            <Checkbox
                                                                checked={areAllSendersInDomainSelected(result.domain)}
                                                                onCheckedChange={(checked) => handleDomainSelect(result.domain, checked as boolean)}
                                                                disabled={isTrashing}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="font-medium text-foreground">{result.domain}</TableCell>
                                                        <TableCell className="text-muted-foreground">{result.emailCount}</TableCell>
                                                        <TableCell className="text-muted-foreground">{result.openedCount}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const domainSenders = result.individualSenders.map(s => s.email);
                                                                    handleTrashSenders(domainSenders);
                                                                }}
                                                                disabled={isTrashing}
                                                                className="p-2 h-8 w-8"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                <span className="sr-only">Trash all emails from {result.domain}</span>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>

                                                    {expandedRows.has(result.domain) && (
                                                        <TableRow key={`${result.domain}-details`}>
                                                            <TableCell colSpan={6} className="p-0">
                                                                <div className="p-4 bg-muted/50 border-t border-border">
                                                                    <h4 className="font-semibold text-foreground mb-2 text-sm">Individual Senders:</h4>
                                                                    <Table>
                                                                        <TableHeader>
                                                                            <TableRow>
                                                                                <TableHead className="text-xs w-1/2">Email Address</TableHead>
                                                                                <TableHead className="text-xs">Total</TableHead>
                                                                                <TableHead className="text-xs">Opened %</TableHead>
                                                                                <TableHead className="text-xs text-right">Actions</TableHead>
                                                                            </TableRow>
                                                                        </TableHeader>
                                                                        <TableBody>
                                                                            {result.individualSenders.map((sender) => (
                                                                                <TableRow key={sender.email}>
                                                                                    <TableCell className="text-xs">
                                                                                        <Checkbox
                                                                                            checked={selectedIndividualSenders.has(sender.email)}
                                                                                            onCheckedChange={(checked) => handleIndividualSenderSelect(sender.email, checked as boolean)}
                                                                                            disabled={isTrashing}
                                                                                            className="mr-2"
                                                                                        />
                                                                                        {sender.email}
                                                                                    </TableCell>
                                                                                    <TableCell className="text-xs">{sender.emailCount}</TableCell>
                                                                                    <TableCell className="text-xs">{sender.openedPercent.toFixed(2)}%</TableCell>
                                                                                    <TableCell className="text-right">
                                                                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    handleTrashSenders([sender.email]);
                                                                                                }}
                                                                                                disabled={isTrashing}>
                                                                                            <Trash2 className="h-4 w-4" />
                                                                                        </Button>
                                                                                        { (sender.isMailList) && (
                                                                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                                                                            onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            handleUnsubscribe([sender.email]);
                                                                                            }}
                                                                                            disabled={isTrashing}>
                                                                                            <Pizza className="h-4 w-4" />
                                                                                            </Button>

                                                                                        )}
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            ))}
                                                                        </TableBody>
                                                                    </Table>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {scanResults.length === 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-muted-foreground">No email data to display</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}