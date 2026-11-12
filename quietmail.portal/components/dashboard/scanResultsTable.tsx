"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Newspaper, Mail, AlertCircle, Filter } from "lucide-react";
import { ScanResult } from "@/lib/types";
import { DashboardStats } from "@/components/dashboard/dashboardStats";
import { SelectionActionBar } from "./selectionActionBar";

interface ScanResultsTableProps {
  scanResults: ScanResult[];
  isTrashing: boolean;
  onTrash: (senderEmails: string[]) => void;
  onUnsubscribe: (senderEmails: string[]) => void;
  onUnsubscribeAndTrash: (senderEmails: string[]) => void;
  isNotificationVisible: boolean;
}

export function ScanResultsTable({
  scanResults,
  isTrashing,
  onTrash,
  onUnsubscribe,
  onUnsubscribeAndTrash,
  isNotificationVisible,
}: ScanResultsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedIndividualSenders, setSelectedIndividualSenders] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<"all" | "low_engagement" | "newsletters">("all");

  const filteredScanResults = useMemo(() => {
    return scanResults
      .map((result) => {
        let matchingSenders = result.individualSenders;

        if (activeFilter === "low_engagement") {
          matchingSenders = matchingSenders.filter((s) => s.openedPercent < 20);
        } else if (activeFilter === "newsletters") {
          matchingSenders = matchingSenders.filter((s) => s.isMailList);
        }

        if (matchingSenders.length === 0) return null;

        const emailCount = matchingSenders.reduce((acc, s) => acc + s.emailCount, 0);
        const openedCount = matchingSenders.reduce(
          (acc, s) => acc + Math.round((s.emailCount * s.openedPercent) / 100),
          0
        );

        return {
          ...result,
          individualSenders: matchingSenders,
          emailCount,
          openedCount,
        };
      })
      .filter((r): r is ScanResult => r !== null);
  }, [scanResults, activeFilter]);

  const handleRowToggle = (domain: string) => {
    const next = new Set(expandedRows);
    if (next.has(domain)) next.delete(domain);
    else next.add(domain);
    setExpandedRows(next);
  };

  useEffect(() => {
    const validEmails = new Set(
      scanResults.flatMap((domain) => domain.individualSenders.map((s) => s.email))
    );

    setSelectedIndividualSenders((prev) => {
      const cleaned = new Set<string>();
      prev.forEach((email) => {
        if (validEmails.has(email)) cleaned.add(email);
      });
      return cleaned;
    });
  }, [scanResults]);

  const handleDomainSelect = (domain: string, isSelected: boolean) => {
    const next = new Set(selectedIndividualSenders);
    const domainResult = filteredScanResults.find((r) => r.domain === domain);
    if (domainResult) {
      domainResult.individualSenders.forEach((sender) => {
        if (isSelected) next.add(sender.email);
        else next.delete(sender.email);
      });
    }
    setSelectedIndividualSenders(next);
  };

  const handleSelectAllDomains = (isSelected: boolean) => {
    const next = new Set<string>();
    if (isSelected) {
      filteredScanResults.forEach((result) => {
        result.individualSenders.forEach((sender) => next.add(sender.email));
      });
    }
    setSelectedIndividualSenders(next);
  };

  const handleIndividualSenderSelect = (senderEmail: string, isSelected: boolean) => {
    const next = new Set(selectedIndividualSenders);
    if (isSelected) next.add(senderEmail);
    else next.delete(senderEmail);
    setSelectedIndividualSenders(next);
  };

  const areAllSendersInDomainSelected = (domain: string): boolean => {
    const domainResult = filteredScanResults.find((r) => r.domain === domain);
    if (!domainResult || domainResult.individualSenders.length === 0) return false;
    return domainResult.individualSenders.every((sender) => selectedIndividualSenders.has(sender.email));
  };

  const totalSendersCount = filteredScanResults.reduce(
    (acc, curr) => acc + curr.individualSenders.length,
    0
  );

  const isSelectAllDomainsChecked =
    filteredScanResults.length > 0 &&
    filteredScanResults.every((result) => areAllSendersInDomainSelected(result.domain));

  return (
    <div className="space-y-4 relative pb-20">
      <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-border/60 bg-card/40 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="select-all-domains"
              checked={isSelectAllDomainsChecked}
              onCheckedChange={handleSelectAllDomains}
              disabled={isTrashing}
              className="border-border/80 data-[state=checked]:bg-primary"
            />
            <label
              htmlFor="select-all-domains"
              className="text-xs font-mono font-medium text-muted-foreground cursor-pointer select-none"
            >
              Select All ({totalSendersCount} Senders)
            </label>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={activeFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("all")}
              className="h-8 text-xs font-mono gap-1 px-3"
            >
              <Filter className="w-3 h-3" />
              <span>All</span>
            </Button>

            <Button
              variant={activeFilter === "newsletters" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("newsletters")}
              className="h-8 text-xs font-mono gap-1 px-3"
            >
              <Newspaper className="w-3 h-3" />
              <span>Mailing Lists</span>
            </Button>

            <Button
              variant={activeFilter === "low_engagement" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("low_engagement")}
              className="h-8 text-xs font-mono gap-1 px-3"
            >
              <AlertCircle className="w-3 h-3" />
              <span>Low Engagement</span>
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/60 bg-muted/20 hover:bg-transparent">
              <TableHead className="w-10" />
              <TableHead className="w-10" />
              <TableHead className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Domain
              </TableHead>
              <TableHead className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Volume
              </TableHead>
              <TableHead className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Opened Ratio
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/40">
            {filteredScanResults.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-xs font-mono text-muted-foreground">
                  No email senders match the selected filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredScanResults.map((result) => {
                const isAllSelected = areAllSendersInDomainSelected(result.domain);
                const isExpanded = expandedRows.has(result.domain);

                return (
                  <React.Fragment key={result.domain}>
                    <TableRow
                      className={`transition-colors cursor-pointer group ${
                        isExpanded ? "bg-accent/30" : "hover:bg-accent/20"
                      }`}
                      onClick={() => handleRowToggle(result.domain)}
                    >
                      <TableCell className="w-10 text-center pr-0" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRowToggle(result.domain)}
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        >
                          <ChevronRight
                            className={`h-4 w-4 transition-transform duration-200 ${
                              isExpanded ? "rotate-90 text-primary" : ""
                            }`}
                          />
                        </Button>
                      </TableCell>
                      <TableCell className="w-10" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isAllSelected}
                          onCheckedChange={(checked) =>
                            handleDomainSelect(result.domain, checked as boolean)
                          }
                          disabled={isTrashing}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${result.domain}&sz=64`}
                            alt=""
                            className="w-4 h-4 rounded-sm opacity-80"
                            onError={(e) => (e.currentTarget.style.display = "none")}
                          />
                          <span className="text-sm font-semibold">{result.domain}</span>
                          <Badge variant="outline" className="text-[10px] font-mono py-0 px-1.5 h-4 border-border/60">
                            {result.individualSenders.length} senders
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {result.emailCount} emails
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {result.openedCount} opened
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow key={`${result.domain}-details`} className="bg-background/40 hover:bg-background/40">
                        <TableCell colSpan={5} className="p-0">
                          <div className="p-4 border-t border-border/40 space-y-2 bg-background/20">
                            <Table>
                              <TableHeader>
                                <TableRow className="border-none hover:bg-transparent">
                                  <TableHead className="w-8" />
                                  <TableHead className="text-[11px] font-mono text-muted-foreground/70">
                                    SENDER ADDRESS
                                  </TableHead>
                                  <TableHead className="text-[11px] font-mono text-muted-foreground/70">
                                    COUNT
                                  </TableHead>
                                  <TableHead className="text-[11px] font-mono text-muted-foreground/70">
                                    ENGAGEMENT RATE
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {result.individualSenders.map((sender) => {
                                  const isSenderSelected = selectedIndividualSenders.has(sender.email);
                                  const openRate = Math.round(sender.openedPercent);

                                  return (
                                    <TableRow
                                      key={sender.email}
                                      className="hover:bg-accent/30 transition-colors border-border/20 cursor-pointer"
                                      onClick={() =>
                                        handleIndividualSenderSelect(sender.email, !isSenderSelected)
                                      }
                                    >
                                      <TableCell className="w-8" onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                          checked={isSenderSelected}
                                          onCheckedChange={(checked) =>
                                            handleIndividualSenderSelect(sender.email, checked as boolean)
                                          }
                                          disabled={isTrashing}
                                        />
                                      </TableCell>
                                      <TableCell className="text-xs font-mono text-foreground">
                                        <div className="flex items-center gap-2">
                                          <Mail className="w-3.5 h-3.5 text-muted-foreground/60" />
                                          <span>{sender.email}</span>
                                          {sender.isMailList && (
                                            <Badge
                                              variant="secondary"
                                              className="text-[9px] font-mono py-0 px-1 bg-primary/10 text-primary border-primary/20"
                                            >
                                              <Newspaper className="h-3 w-3 mr-1" />
                                              List
                                            </Badge>
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-xs font-mono text-muted-foreground">
                                        {sender.emailCount}
                                      </TableCell>
                                      <TableCell className="text-xs font-mono">
                                        <div className="flex items-center gap-2 max-w-[140px]">
                                          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                            <div
                                              className={`h-full rounded-full ${
                                                openRate > 50
                                                  ? "bg-emerald-500"
                                                  : openRate > 20
                                                  ? "bg-amber-500"
                                                  : "bg-rose-500"
                                              }`}
                                              style={{ width: `${openRate}%` }}
                                            />
                                          </div>
                                          <span className="text-[10px] text-muted-foreground font-mono">
                                            {openRate}%
                                          </span>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {!isNotificationVisible && selectedIndividualSenders.size > 0 && (
        <SelectionActionBar
          scanResults={scanResults}
          selectedEmails={selectedIndividualSenders}
          isTrashing={isTrashing}
          onClearSelection={() => setSelectedIndividualSenders(new Set())}
          onTrash={onTrash}
          onUnsubscribe={onUnsubscribe}
          onUnsubscribeAndTrash={onUnsubscribeAndTrash}
        />
      )}
    </div>
  );
}