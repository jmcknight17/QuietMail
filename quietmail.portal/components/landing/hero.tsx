import React from 'react';
import { Button } from '@/components/ui/button';
import { Mail, ArrowRight, ShieldCheck, Sparkles, Inbox, GitBranchIcon, Github } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { IconBrandGithub } from '@tabler/icons-react';

export function Hero() {

    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5022";

     const handleStartScan = () => {
        router.push('/dashboard');
        };
    

    return (
        <section className="relative w-full min-h-[75vh] flex flex-col items-center justify-between overflow-hidden bg-transparent pt-24 pb-12 px-4 ">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />

            <div className="max-w-4xl mx-auto text-center space-y-6 z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary shadow-sm">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Open Source Inbox Cleaner & Analytics</span>
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
                    Reclaim your inbox in <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">seconds, not hours.</span>
                </h1>

                <p className="max-w-2xl mx-auto text-base md:text-lg text-muted-foreground">
                    QuietMail cuts through newsletter clutter, bulk-trashed spam, and dead subscriptions with high-performance .NET automation and lightning-fast Next.js UI.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    {isAuthenticated ? (
                                  <Button 
                                    onClick={handleStartScan} 
                                    size="lg" 
                                    variant="outline"
                                    className="rounded-full px-8 shadow-lg transition-transform active:scale-95"
                                  >
                                    Perform Scan
                                  </Button>
                                ) : (
                                  <a href={`${apiUrl}/auth/gmail/login`}>
                                    <Button size="lg" variant="outline" className="rounded-full px-6">
                                      <Image
                                        src="/google_login.png"  
                                        alt="Google Logo" 
                                        width={30} 
                                        height={18} 
                                        className="mr-1"
                                      />
                                      Get Started Free
                                    </Button>
                                  </a>
                                )}
                    <Button asChild variant="outline" size="lg" className="rounded-full px-6">
                        <Link href="https://github.com/jmcknight17/QuietMail" target="_blank">
                        <IconBrandGithub className="h-5 w-5" />
                            View on GitHub
                        </Link>
                    </Button>
                </div>

                <div className="flex items-center justify-center gap-6 pt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        <span>Secure OAuth Integration</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Inbox className="h-4 w-4 text-primary" />
                        <span>Zero Data Storage</span>
                    </div>
                </div>
            </div>
        </section>
    );
}