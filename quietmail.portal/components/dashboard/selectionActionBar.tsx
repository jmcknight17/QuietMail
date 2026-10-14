import React from 'react';
import { Button } from '@/components/ui/button'; // 👈 Add this line!
import { Trash2, X, Ban } from 'lucide-react';
import { ScanResult } from '@/lib/types';

export function SelectionActionBar({
    scanResults,
    selectedEmails,
    isTrashing,
    onClearSelection,
    onTrash,
    onUnsubscribe,
    onUnsubscribeAndTrash
}: SelectionActionBarProps) {
    if (selectedEmails.size === 0) return null;

    let totalEmails = 0;
    let uniqueDomains = 0;
    let validSendersCount = 0;

    scanResults.forEach(domainResult => {
        const selectedInDomain = domainResult.individualSenders.filter(s => 
            selectedEmails.has(s.email)
        );
        
        if (selectedInDomain.length > 0) {
            uniqueDomains++;
            validSendersCount += selectedInDomain.length;
            totalEmails += selectedInDomain.reduce((sum, s) => sum + s.emailCount, 0);
        }
    });

    if (validSendersCount === 0) return null;

    const selectedArray = Array.from(selectedEmails);

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="bg-foreground text-background shadow-2xl rounded-full px-6 py-4 flex items-center gap-6 md:gap-8 border border-border/20">
                
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-sm font-medium">
                    <span className="text-background/90">
                        <strong className="text-background text-base">{validSendersCount}</strong> Senders
                    </span>
                    <span className="hidden md:inline text-background/90">•</span>
                    <span className="text-background/90">
                        <strong className="text-background text-base">{uniqueDomains}</strong> Domains
                    </span>
                    <span className="hidden md:inline text-background/90">•</span>
                    <span className="text-background/90">
                        <strong className="text-background text-base">{totalEmails}</strong> Emails
                    </span>
                </div>

                <div className="h-8 w-[1px] bg-background/20 hidden md:block"></div>
                
                <div className="flex items-center gap-2">
                    <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => onTrash(selectedArray)}
                        disabled={isTrashing}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {isTrashing ? 'Trashing...' : 'Trash'}
                    </Button>

                    <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => onUnsubscribeAndTrash(selectedArray)}
                        disabled={isTrashing}
                    >
                        <Ban className="h-4 w-4 mr-2" />
                        {isTrashing ? 'Trashing...' : 'Trash And Unsubscribe'}
                    </Button>

                    <Button 
                        variant="ghost" 
                        size="icon"
                        className="ml-2 rounded-full hover:bg-background/20 text-background"
                        onClick={onClearSelection}
                        disabled={isTrashing}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}