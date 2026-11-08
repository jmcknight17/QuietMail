"use client";

import React from "react";
import { WORKFLOW_STEPS } from "@/constants/workflow";
import { CheckCircle2 } from "lucide-react";

export function WorkflowSummary() {
  return (
    <section className="relative w-full max-w-4xl mx-auto px-4 py-24 bg-transparent">
      <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          How QuietMail Works
        </h2>
        <p className="text-muted-foreground text-sm md:text-base">
          From authentication to inbox cleanup in three storage-free steps.
        </p>
      </div>

      <div className="relative">
        <div className="absolute left-6 md:left-1/2 top-3 bottom-3 w-px bg-gradient-to-b from-primary/60 via-border/80 to-transparent -translate-x-1/2 hidden sm:block" />

        <div className="space-y-16">
          {WORKFLOW_STEPS.map((item, index) => {
            const isEven = index % 2 === 0;
            return (
              <div
                key={item.step}
                className="relative flex flex-col sm:flex-row items-start sm:items-center gap-8 group"
              >
                <div
                  className={`w-full sm:w-1/2 ${
                    isEven ? "sm:text-right sm:pr-12" : "sm:order-2 sm:pl-12"
                  }`}
                >
                  <div className="inline-flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono font-semibold text-primary tracking-wider">
                      STEP {item.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full border border-primary/40 bg-background shadow-lg group-hover:border-primary transition-colors">
                  <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                </div>

                <div
                  className={`w-full sm:w-1/2 ${
                    isEven ? "sm:order-2 sm:pl-12" : "sm:pr-12 sm:text-right"
                  }`}
                >
                  <div className="inline-block p-3 rounded-lg border border-border/60 bg-card/20 backdrop-blur-sm font-mono text-xs text-muted-foreground space-y-1">
                    <div className="text-primary/90 font-medium">{item.meta}</div>
                    <div className="flex items-center gap-1.5 justify-start sm:group-hover:text-foreground transition-colors">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{item.detail}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}