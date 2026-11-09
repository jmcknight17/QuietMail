import React from "react";
import Link from "next/link";
import { Shield, Terminal, ArrowUpRight } from "lucide-react";
import { IconBrandGithub } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export function OpensourceSummary() {
  const cloneCommand = "git clone https://github.com/jmcknight17/QuietMail";

  return (
    <section className="relative w-full max-w-5xl mx-auto px-4 py-20 bg-transparent">
      <div className="rounded-2xl border border-border/80 bg-card/60 p-8 md:p-12 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono">
              <Shield className="w-3.5 h-3.5" />
              <span>MIT License // 100% Free & Open Source</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Inspect the code. Self-host locally.
            </h2>

            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              QuietMail is built with complete transparency. Audit the .NET engine, run the API stack locally, or contribute to the Next.js frontend codebase on GitHub.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="https://github.com/jmcknight17/QuietMail"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="gap-2 font-medium">
                  <IconBrandGithub className="w-4 h-4" />
                  <span>View Repository</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-xl border border-border/80 bg-background/90 p-4 font-mono text-xs space-y-3 shadow-inner">
              <div className="flex items-center justify-between text-muted-foreground border-b border-border/60 pb-2">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary" />
                  <span>Quickstart</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground/60">bash</span>
              </div>

              <div className="pt-1 text-emerald-400 overflow-x-auto whitespace-nowrap font-mono">
                <code>{cloneCommand}</code>
              </div>

              <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Backend: .NET 8 Web API</span>
                <span className="text-primary font-medium">Zero Storage</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}