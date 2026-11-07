'use client'

import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext' ;
import { Mail, LogOut,User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';


export function DashboardHeader() {

    const {isAuthenticated, logout, pictureUrl, userEmail} = useAuth();
    const [isScrolled, setIsScrolled] = React.useState(false);

    

    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    const handleHomeNavigation = () => {
            router.push('/')
    }


    
    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
            isScrolled 
                ? 'py-3 px-4 flex justify-center border-transparent' 
                : 'bg-card border-b border-border/40 py-0'
        }`}>
            <div className={`transition-all duration-300 ease-in-out flex items-center justify-between ${
                isScrolled 
                    ? 'w-[80%] max-w-5xl rounded-2xl border border-border/60 bg-background/80 backdrop-blur-xl shadow-2xl px-6 py-2.5' 
                    : 'container mx-auto px-4 py-3'
            }`}>

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
                    className="group relative h-7 w-7 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                    <Avatar className="h-7 w-7 border border-border">
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