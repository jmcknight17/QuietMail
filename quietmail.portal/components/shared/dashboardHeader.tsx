'use client'

import React from 'react';
import { useAuth } from '../../context/AuthContext' ;
import { Mail, LogOut,User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';


export function DashboardHeader() {

    const {isAuthenticated, logout, pictureUrl, userEmail} = useAuth();

    const router = useRouter();

    const handleHomeNavigation = () => {
            router.push('/')
    }
    
    return (
        <header className="bg-card/100 border-b border-border/40">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button 
                    onClick={handleHomeNavigation}
                    className="group flex items-center gap-2 cursor-pointer focus:outline-none transition-opacity duration-200 hover:opacity-80"
                    >
                    <Mail className="h-5 w-5 text-primary"/>
                    <h1 className="text-lg font-semibold text-foreground">QuietMail</h1>
                    </button>
                </div>
                {isAuthenticated && (
                <button
                    onClick={logout}
                    title="Log out"
                    aria-label="Log out"
                    className="group relative h-9 w-9 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                    <Avatar className="h-9 w-9 border border-border">
                        <AvatarImage src={pictureUrl} alt={userEmail || "User Avatar"} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            <User className="h-4 w-4" />
                        </AvatarFallback>
                    </Avatar>

                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <LogOut className="h-4 w-4 text-white" />
                    </div>
                </button>
                )}
            </div>
        </header>
    );
}