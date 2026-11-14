'use client';
import React from 'react';
import { Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ScanHeroProps {
    isScanning: boolean;
    progress: number;
    onStartScan: () => void;
}

export function ScanHero({ isScanning, progress, onStartScan }: ScanHeroProps) {
    return (
        <div className="mt-8 relative rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl p-6 md:p-8 shadow-xl overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                        Inbox Deep Scan
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Inspect recurring senders and subscriptions in-memory using .NET 8 async streams.
                    </p>
                </div>

                <div className="shrink-0 w-full md:w-auto">
                    {isScanning ? (
                        <div className="w-full md:w-64 space-y-2.5 p-4 rounded-xl border border-border/60 bg-background/50">
                            <div className="flex items-center justify-between text-xs font-medium">
                                <span className="flex items-center gap-2 text-emerald-400">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Scanning headers...
                                </span>
                                <span className="text-muted-foreground font-mono">{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-1.5 bg-secondary" />
                        </div>
                    ) : (
                        <Button
                            onClick={onStartScan}
                            size="lg"
                            className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer gap-2 rounded-xl px-6"
                        >
                            <Zap className="h-4 w-4 fill-current" />
                            Start In-Memory Scan
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}