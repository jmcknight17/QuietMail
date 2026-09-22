import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Ripple } from '@/components/ui/ripple';

interface ScanHeroProps {
    isScanning: boolean;
    progress: number;
    onStartScan: () => void;
}

export function ScanHero({ isScanning, progress, onStartScan }: ScanHeroProps) {
    return (
        <div className="relative flex min-h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-xl border bg-card/50 shadow-sm mt-8">
            <div className="z-10 flex flex-col items-center space-y-6 text-center max-w-md p-6 bg-background/80 backdrop-blur-md rounded-2xl border shadow-lg">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Inbox Analysis</h2>
                    <p className="text-muted-foreground text-sm">
                        Perform a comprehensive scan to identify recurring senders and clean up your inbox.
                    </p>
                </div>
                
                <div className="w-full pt-4">
                    {/* 2. We use the props passed from the parent to determine what to show */}
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
            
            {/* 3. The Ripple lives safely at the bottom of this isolated container */}
            <Ripple />
        </div>
    );