import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, X, Ban, Bomb } from 'lucide-react';
import { ScanResult } from '@/lib/types';

interface SelectionActionBarProps {
    scanResults: ScanResult[];
    selectedEmails: Set<string>;
    isTrashing: boolean;
    onClearSelection: () => void;
    onTrash: (emails: string[]) => void;
    onUnsubscribe: (emails: string[]) => void;
}

export function SelectionActionBar({
    scanResults,
    selectedEmails,
    isTrashing,
    onClearSelection,
    onTrash,
    onUnsubscribe
}: SelectionActionBarProps) {
    if (selectedEmails.size === 0) return null;

    let totalEmails = 0;
    let uniqueDomains = 0;

    scanResults.forEach(domainResult => {
        const selectedInDomain = domainResult.individualSenders.filter(s => 
            selectedEmails.has(s.email)
        );
        
        if (selectedInDomain.length > 0) {
            uniqueDomains++;
            totalEmails += selectedInDomain.reduce((sum, s) => sum + s.emailCount, 0);
        }
    });

    const selectedArray = Array.from(selectedEmails);

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="bg-foreground text-background shadow-2xl rounded-full px-6 py-4 flex items-center gap-6 md:gap-8 border border-border/20">
                
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-sm font-medium">
                    <span className="text-background/90">
                        <strong className="text-background text-base">{selectedEmails.size}</strong> Senders
                    </span>
                    <span className="hidden md:inline text-background/90">•</span>
                    <span className="text-text-background/90">
                        <strong className="text-background text-base">{uniqueDomains}</strong> Domains
                    </span>
                    <span className="hidden md:inline ttext-background/90">•</span>
                    <span className="text-text-background/90">
                        <strong className="text-background text-base">{totalEmails}</strong> Emails
                    </span>
                </div>

                <div className="h-8 w-[1px] bg-background/20 hidden md:block"></div>
                
                <div className="flex items-center gap-2">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="hover:bg-background/20 text-background hover:text-background"
                        onClick={() => onUnsubscribe(selectedArray)}
                        disabled={isTrashing}
                    >
                        <Ban className="h-4 w-4 mr-2" />
                        Unsubscribe
                    </Button>
                    
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
                        onClick={() => onTrash(selectedArray)}
                        disabled={isTrashing}
                    >
                        <Bomb className="h-4 w-4 mr-2" />
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