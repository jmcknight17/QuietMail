"use client";

import React from "react";
import { Pillars} from "@/constants/summaryPillars";
import {SummaryPillars} from "@/constants/summaryPillars";

export function SummaryStrip() {
    const pillars: Pillars[] = SummaryPillars;

    return (
    <section className="relative w-full max-w-6xl mx-auto px-4 py-12 bg-transparent">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {pillars.map((pillar) => {
        const Icon = pillar.icon;
          return (
            <div
              key={pillar.title}
              className="p-5 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-md hover:bg-card/60 transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 group-hover:scale-105 transition-transform">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">
                {pillar.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {pillar.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}