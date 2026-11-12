import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';


interface ScanHeroProps {
    isScanning: boolean;
    progress: number;
    onStartScan: () => void;
}

export function ScanHero({ isScanning, progress, onStartScan }: ScanHeroProps) {
    return (
        <div className="flex w-full flex-col items-center border-transparent mt-8">
            <div className="z-10 flex-col items-center space-y-6 text-center max-w-md p-6 rounded-2xl border">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Inbox Analysis</h2>
                    <p className="text-muted-foreground text-sm">
                        Perform a comprehensive scan to identify recurring senders and clean up your inbox.
                    </p>
                </div>
                
                <div className="w-full pt-4">
                    {!isScanning ? (
                        <Button
                            size="lg"
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md transition-all"
                            onClick={onStartScan}
                        >
                            Start Deep Scan
                        </Button>
                    ) : (
                        <div className="space-y-3 w-full">
                            <div className="flex items-center justify-between text-sm font-medium">
                                <span className="text-primary animate-pulse">Analyzing...</span>
                                <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-3 rounded-full" />
                        </div>
                    )}
                </div>
            </div>
            
        </div>
    );