'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    isAuthenticated : boolean; 
    isLoading : boolean; 
    userEmail : string | null; 
    pictureUrl : string | null;
    provider : string | null; 
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7297";
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [pictureUrl, setPictureUrl] = useState<string | null>(null);
    const [provider, setProvider] = useState<string | null>(null);

    useEffect(() => {
        async function checkAuthStatus() {
            try {
                const response = await fetch(`${apiUrl}/auth/me`, {
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    setIsAuthenticated(true);
                    setUserEmail(data.user.email);
                    setPictureUrl(data.user.pictureUrl)
                    setProvider(data.user.provider)
                    console.log(data)
                } else {
                    setIsAuthenticated(false);
                    router.push('/')
                }
            } catch (error) {
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        }

        checkAuthStatus();
    }, []);

    const logout = async () => {
        await fetch(`${apiUrl}/auth/logout`, { method: 'POST', credentials: 'include' });
        setIsAuthenticated(false);
        setUserEmail(null);
        router.push('/')
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, userEmail, pictureUrl, provider, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
}