import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, Newspaper } from 'lucide-react';
import { ScanResult } from '@/lib/types';
import { DashboardStats } from "@/components/dashboard/dashboardStats";
import { SelectionActionBar } from './selectionActionBar';

interface ScanResultsTableProps {
    scanResults: ScanResult[];
    isTrashing: boolean;
    onTrash: (senderEmails: string[]) => void;
    onUnsubscribe: (senderEmails: string[]) => void;
    onUnsubscribeAndTrash: (senderEmails: string[]) => void;
}

export function ScanResultsTable({ scanResults, isTrashing, onTrash, onUnsubscribe, onUnsubscribeAndTrash }: ScanResultsTableProps) {
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [selectedIndividualSenders, setSelectedIndividualSenders] = useState<Set<string>>(new Set());

    const handleRowToggle = (domain: string) => {
        const newExpandedRows = new Set(expandedRows);
        if (newExpandedRows.has(domain)) newExpandedRows.delete(domain);
        else newExpandedRows.add(domain);
        setExpandedRows(newExpandedRows);
    };

    const handleDomainSelect = (domain: string, isSelected: boolean) => {
        const newSelectedIndividualSenders = new Set(selectedIndividualSenders);
        const domainResult = scanResults.find(r => r.domain === domain);
        if (domainResult) {
            domainResult.individualSenders.forEach(sender => {
                if (isSelected) newSelectedIndividualSenders.add(sender.email);
                else newSelectedIndividualSenders.delete(sender.email);
            });
        }
        setSelectedIndividualSenders(newSelectedIndividualSenders);
    };

    const handleSelectAllDomains = (isSelected: boolean) => {
        const newSelectedIndividualSenders = new Set<string>();
        if (isSelected) {
            scanResults.forEach(result => {
                result.individualSenders.forEach(sender => newSelectedIndividualSenders.add(sender.email));
            });
        }
        setSelectedIndividualSenders(newSelectedIndividualSenders);
    };

    const handleIndividualSenderSelect = (senderEmail: string, isSelected: boolean) => {
        const newSelectedSenders = new Set(selectedIndividualSenders);
        if (isSelected) newSelectedSenders.add(senderEmail);
        else newSelectedSenders.delete(senderEmail);
        setSelectedIndividualSenders(newSelectedSenders);
    };

    const areAllSendersInDomainSelected = (domain: string): boolean => {
        const domainResult = scanResults.find(r => r.domain === domain);
        if (!domainResult || domainResult.individualSenders.length === 0) return false;
        return domainResult.individualSenders.every(sender => selectedIndividualSenders.has(sender.email));
    };

    const isSelectAllDomainsChecked = scanResults.length > 0 && scanResults.every(result => areAllSendersInDomainSelected(result.domain));

    return (
        <div className="space-y-4 relative pb-20">
            <DashboardStats scanResult={scanResults} />

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="select-all-domains"
                    checked={isSelectAllDomainsChecked}
                    onCheckedChange={handleSelectAllDomains}
                    disabled={isTrashing}
                />
                <label htmlFor="select-all-domains" className="text-sm text-muted-foreground font-medium cursor-pointer">
                    Select All ({scanResults.reduce((acc, curr) => acc + curr.individualSenders.length, 0)} Senders)
                </label>
            </div>

            <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-12"><span className="sr-only">Toggle</span></TableHead>
                            <TableHead className="w-12"><span className="sr-only">Select</span></TableHead>
                            <TableHead className="text-foreground font-semibold">Sender Domain</TableHead>
                            <TableHead className="text-foreground font-semibold">Total Emails</TableHead>
                            <TableHead className="text-foreground font-semibold">Opened Emails</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {scanResults.map((result) => {
                            const isAllSelected = areAllSendersInDomainSelected(result.domain);

                            return (
                                <React.Fragment key={result.domain}>
                                    {/* Parent Domain Row */}
                                    <TableRow
                                        className="bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                                        onClick={() => handleDomainSelect(result.domain, !isAllSelected)}
                                    >
                                        <TableCell className="w-12 text-center pr-0" onClick={(e) => e.stopPropagation()}>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRowToggle(result.domain)}
                                                className="h-8 w-8 p-0"
                                            >
                                                <ChevronDown className={`h-4 w-4 transition-transform ${expandedRows.has(result.domain) ? 'rotate-180' : ''}`} />
                                            </Button>
                                        </TableCell>
                                        <TableCell className="w-12" onClick={(e) => e.stopPropagation()}>
                                            <Checkbox
                                                checked={isAllSelected}
                                                onCheckedChange={(checked) => handleDomainSelect(result.domain, checked as boolean)}
                                                disabled={isTrashing}
                                                className="mr-2 translate-y-[2px] border-2 border-primary"
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium text-foreground">{result.domain}</TableCell>
                                        <TableCell className="text-muted-foreground">{result.emailCount}</TableCell>
                                        <TableCell className="text-muted-foreground">{result.openedCount}</TableCell>
                                    </TableRow>

                                    {/* Expanded Child Rows Section */}
                                    {expandedRows.has(result.domain) && (
                                        <TableRow key={`${result.domain}-details`}>
                                            <TableCell colSpan={5} className="p-0">
                                                <div className="p-4 bg-muted/50 border-t border-border">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead className="text-xs w-12"><span className="sr-only">Select</span></TableHead>
                                                                <TableHead className="text-xs">Email Address</TableHead>
                                                                <TableHead className="text-xs">Total</TableHead>
                                                                <TableHead className="text-xs">Opened %</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {result.individualSenders.map((sender) => {
                                                                const isSenderSelected = selectedIndividualSenders.has(sender.email);

                                                                return (
                                                                    <TableRow
                                                                        key={sender.email}
                                                                        className="hover:bg-accent/40 transition-colors cursor-pointer"
                                                                        onClick={() => handleIndividualSenderSelect(sender.email, !isSenderSelected)}
                                                                    >
                                                                        <TableCell className="w-12" onClick={(e) => e.stopPropagation()}>
                                                                            <Checkbox
                                                                                checked={isSenderSelected}
                                                                                onCheckedChange={(checked) => handleIndividualSenderSelect(sender.email, checked as boolean)}
                                                                                disabled={isTrashing}
                                                                                className="mr-2 translate-y-[2px] border-2 border-primary"
                                                                            />
                                                                        </TableCell>
                                                                        <TableCell className="text-xs font-medium text-foreground">{sender.email}{sender.isMailList && (<Newspaper className="h-4 w-4 inline-block mr-1 ml-2" />)}</TableCell>
                                                                        <TableCell className="text-xs text-muted-foreground">{sender.emailCount}</TableCell>
                                                                        <TableCell className="text-xs text-muted-foreground">{sender.openedPercent.toFixed(0)}%</TableCell>
                                                                    </TableRow>
                                                                );
                                                            })}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            <SelectionActionBar
                scanResults={scanResults}
                selectedEmails={selectedIndividualSenders}
                isTrashing={isTrashing}
                onClearSelection={() => setSelectedIndividualSenders(new Set())}
                onTrash={onTrash}
                onUnsubscribe={onUnsubscribe}
                onUnsubscribeAndTrash={onUnsubscribeAndTrash}
            />
        </div>
    );
}