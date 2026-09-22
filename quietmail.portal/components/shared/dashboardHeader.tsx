import React from 'react';
import { Mail } from 'lucide-react';

export function DashboardHeader() {
    return (
        <header className="bg-card/100 border-b border-border/40">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    <h1 className="text-lg font-semibold text-foreground">QuietMail</h1>
                </div>
            </div>
        </header>
    );
}