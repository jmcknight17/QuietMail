'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { SenderActionResult } from "@/app/dashboard/page";


interface ActionNotificationProps {
    isVisible: boolean;
    message: string;
    notificationDetails?: SenderActionResult[];
    onClose: () => void;
    autoCloseTime?: number;
}

export function ActionNotification({
    isVisible,
    message,
    onClose,
    notificationDetails = [],
    autoCloseTime = 5000,
}: ActionNotificationProps) {
    const [isExpanded, setIsExpanded] = React.useState(false);

    const safeDetails = notificationDetails || [];

    const failures = safeDetails.filter(d => d.unsubscribedError || d.trashedError);
    const hasFailures = failures.length > 0;
    //Only perform the auto-close if there are no errors
    useEffect(() => {
        if (isVisible && autoCloseTime > 0 && !hasFailures) {
            const timer = setTimeout(() => {
                onClose();
            }, autoCloseTime);
            return () => clearTimeout(timer);
        }
    }, [isVisible, autoCloseTime, onClose]);



    if (!isVisible) return null;

    return (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-max max-w-[850px] px-4 animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div
                className={`bg-foreground text-background shadow-2xl transition-all duration-200 border border-border/20 ${isExpanded ? 'rounded-2xl p-4' : 'rounded-full px-6 py-3'
                    }`}
            >

                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                        {hasFailures ? (
                            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
                        ) : (
                            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                        )}

                        <span className="text-sm font-medium text-background/90 whitespace-nowrap">
                            {message}
                        </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                        {hasFailures && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-s text-background/80 hover:text-background hover:bg-background/20"
                                onClick={() => setIsExpanded(!isExpanded)}
                            >
                                {isExpanded ? 'Hide' : <span className="text-red-400">
                                    ({failures.length} issue{failures.length > 1 ? 's' : ''})
                                </span>}
                                {isExpanded ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
                            </Button>
                        )}

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full hover:bg-background/20 text-background"
                            onClick={onClose}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {isExpanded && hasFailures && (
                    <div className="mt-3 pt-3 border-t border-background/20 max-h-48 overflow-y-auto space-y-2 pr-1 text-xs">
                        {failures.map((item, index) => (
                            <div key={index} className="bg-background/10 rounded p-2 text-background/90">
                                <div className="font-semibold truncate">{item.email}</div>
                                {item.unsubscribedError && (
                                    <div className="text-red-300 mt-0.5">
                                        <strong>Unsubscribe: </strong> {item.unsubscribedError}
                                    </div>
                                )}
                                {item.trashedError && (
                                    <div className="text-red-300 mt-0.5">
                                        <strong>Trash: </strong> {item.trashedError}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}