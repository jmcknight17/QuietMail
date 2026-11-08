"use client";

import React from "react";
import { QUIETMAIL_FEATURES, CapabilityRow } from "@/constants/capabilities";
import { MailCheck, BarChart3, ShieldCheck } from "lucide-react";

export function EditorialFeatures() {
  const renderMinimalistIcon = (type: CapabilityRow["iconType"]) => {
    switch (type) {
      case "scan":
        return (
          <div className="w-24 h-24 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-md flex flex-col justify-center p-4 gap-2 shadow-inner">
            <div className="h-2 w-full bg-primary/40 rounded-full animate-pulse" />
            <div className="h-2 w-3/4 bg-primary/60 rounded-full" />
            <div className="h-2 w-5/6 bg-primary/80 rounded-full" />
          </div>
        );
      case "bulk":
        return (
          <div className="w-24 h-24 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-md flex items-center justify-center shadow-inner text-primary">
            <MailCheck className="w-10 h-10 stroke-[1.5]" />
          </div>
        );
      case "analytics":
        return (
          <div className="w-24 h-24 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-md flex items-center justify-center shadow-inner text-primary">
            <BarChart3 className="w-10 h-10 stroke-[1.5]" />
          </div>
        );
      case "security":
        return (
          <div className="w-24 h-24 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-md flex items-center justify-center shadow-inner text-primary">
            <ShieldCheck className="w-10 h-10 stroke-[1.5]" />
          </div>
        );
    }
  };

  return (
    <section className="relative w-full max-w-5xl mx-auto px-4 py-24 bg-transparent">
      <div className="space-y-4 text-center max-w-2xl mx-auto mb-20">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          Engineered for velocity and privacy.
        </h2>
        <p className="text-muted-foreground text-sm md:text-base">
          Every feature designed from the ground up to keep your inbox clean without compromising your data.
        </p>
      </div>

      <div className="divide-y divide-border/60">
        {QUIETMAIL_FEATURES.map((feature) => (
          <div
            key={feature.number}
            className="py-16 first:pt-0 last:pb-0 grid grid-cols-1 md:grid-cols-12 gap-8 items-center group"
          >
            <div className="md:col-span-9 space-y-3">
              <span className="text-xs font-mono font-semibold text-primary tracking-widest">
                {feature.number}
              </span>
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-2xl">
                {feature.description}
              </p>
            </div>

            <div className="md:col-span-3 flex justify-start md:justify-end">
              {renderMinimalistIcon(feature.iconType)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}