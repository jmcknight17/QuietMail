'use client'

import React from 'react';
import { Mail, LogOut,User } from 'lucide-react';
import { UserProfile } from '../../app/dashboard/page';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface dashboardHeaderProps{
    user: UserProfile | null
}

export function DashboardHeader({user} : dashboardHeaderProps) {

    const router = useRouter();

    const handleLogout = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7297";
            await fetch(`${apiUrl}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            router.push('/');
        }
    };

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
                {user && (
                <button
                    onClick={handleLogout}
                    title="Log out"
                    aria-label="Log out"
                    className="group relative h-9 w-9 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                    <Avatar className="h-9 w-9 border border-border">
                        <AvatarImage src={user?.pictureUrl} alt={user?.email || "User Avatar"} />
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