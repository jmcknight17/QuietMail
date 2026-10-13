'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, CheckCircle2 } from 'lucide-react';

interface ActionNotificationProps {
    isVisible: boolean;
    message: string;
    onClose: () => void;
    autoCloseTime?: number; // Defaults to 5000ms
}

export function ActionNotification({
    isVisible,
    message,
    onClose,
    autoCloseTime = 5000,
}: ActionNotificationProps) {
    useEffect(() => {
        if (isVisible && autoCloseTime > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, autoCloseTime);
            return () => clearTimeout(timer);
        }
    }, [isVisible, autoCloseTime, onClose]);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-30 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="bg-foreground text-background shadow-2xl rounded-full px-6 py-3 flex items-center gap-4 border border-border/20">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                
                <span className="text-sm font-medium text-background/90">
                    {message}
                </span>

                <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-7 w-7 rounded-full hover:bg-background/20 text-background ml-2"
                    onClick={onClose}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}