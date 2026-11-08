"use client";

import { MOCK_SCAN_RESULTS } from "@/lib/mocks/scanResultMocks";
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronDown, Newspaper, Trash2, Ban, X, Lock } from "lucide-react";

export function DashboardPreview() {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(
    new Set([MOCK_SCAN_RESULTS[0].domain])
  );
  
  const [selectedIndividualSenders, setSelectedIndividualSenders] = useState<Set<string>>(
    new Set([
      MOCK_SCAN_RESULTS[0].individualSenders[0].email,
      MOCK_SCAN_RESULTS[1].individualSenders[0].email,
    ])
  );

  const handleRowToggle = (domain: string) => {
    const next = new Set(expandedRows);
    if (next.has(domain)) next.delete(domain);
    else next.add(domain);
    setExpandedRows(next);
  };

  const handleDomainSelect = (domain: string, isSelected: boolean) => {
    const next = new Set(selectedIndividualSenders);
    const domainResult = MOCK_SCAN_RESULTS.find((r) => r.domain === domain);
    if (domainResult) {
      domainResult.individualSenders.forEach((sender) => {
        if (isSelected) next.add(sender.email);
        else next.delete(sender.email);
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
    const domainResult = MOCK_SCAN_RESULTS.find((r) => r.domain === domain);
    if (!domainResult || domainResult.individualSenders.length === 0) return false;
    return domainResult.individualSenders.every((sender) => selectedIndividualSenders.has(sender.email));
  };

  const handleSelectAllDomains = (isSelected: boolean) => {
    const next = new Set<string>();
    if (isSelected) {
      MOCK_SCAN_RESULTS.forEach((result) => {
        result.individualSenders.forEach((sender) => next.add(sender.email));
      });
    }
    setSelectedIndividualSenders(next);
  };

  const isSelectAllDomainsChecked =
    MOCK_SCAN_RESULTS.length > 0 &&
    MOCK_SCAN_RESULTS.every((result) => areAllSendersInDomainSelected(result.domain));

  let totalEmails = 0;
  let uniqueDomains = 0;
  let validSendersCount = 0;

  MOCK_SCAN_RESULTS.forEach((domainResult) => {
    const selectedInDomain = domainResult.individualSenders.filter((s) =>
      selectedIndividualSenders.has(s.email)
    );
    if (selectedInDomain.length > 0) {
      uniqueDomains++;
      validSendersCount += selectedInDomain.length;
      totalEmails += selectedInDomain.reduce((sum, s) => sum + s.emailCount, 0);
    }
  });

  return (
    <div className="relative max-w-5xl mx-auto px-4 pb-12">
      <div className="relative rounded-2xl border border-border/80 bg-card/60 shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b border-border/60">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
          </div>
          
          <div className="flex items-center justify-center space-x-2 px-4 py-1 rounded-md bg-background/60 border border-border/40 text-xs font-mono text-muted-foreground w-64 sm:w-80">
            <Lock className="w-3 h-3 text-primary shrink-0" />
            <span className="truncate">https://app.quietmail.io/dashboard</span>
          </div>

          <div className="w-12" />
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center space-x-2 px-1">
            <Checkbox
              id="select-all-preview"
              checked={isSelectAllDomainsChecked}
              onCheckedChange={(checked) => handleSelectAllDomains(checked as boolean)}
              className="border-2 border-primary"
            />
            <label htmlFor="select-all-preview" className="text-sm text-muted-foreground font-medium cursor-pointer">
              Select All ({MOCK_SCAN_RESULTS.reduce((acc, curr) => acc + curr.individualSenders.length, 0)} Senders)
            </label>
          </div>

          <div className="rounded-lg border border-border overflow-hidden bg-background/50">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12"><span className="sr-only">Toggle</span></TableHead>
                  <TableHead className="w-12"><span className="sr-only">Select</span></TableHead>
                  <TableHead className="text-foreground font-semibold">Sender Domain</TableHead>
                  <TableHead className="text-foreground font-semibold">Total Emails</TableHead>
                  <TableHead className="text-foreground font-semibold">Opened Emails</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_SCAN_RESULTS.map((result) => {
                  const isAllSelected = areAllSendersInDomainSelected(result.domain);

                  return (
                    <React.Fragment key={result.domain}>
                      <TableRow
                        className="bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => handleDomainSelect(result.domain, !isAllSelected)}
                      >
                        <TableCell className="w-12 text-center pr-0" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRowToggle(result.domain)}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronDown className={`h-4 w-4 transition-transform ${expandedRows.has(result.domain) ? "rotate-180" : ""}`} />
                          </Button>
                        </TableCell>
                        <TableCell className="w-12" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isAllSelected}
                            onCheckedChange={(checked) => handleDomainSelect(result.domain, checked as boolean)}
                            className="mr-2 translate-y-[2px] border-2 border-primary"
                          />
                        </TableCell>
                        <TableCell className="font-medium text-foreground">{result.domain}</TableCell>
                        <TableCell className="text-muted-foreground">{result.emailCount}</TableCell>
                        <TableCell className="text-muted-foreground">{result.openedCount}</TableCell>
                      </TableRow>

                      {expandedRows.has(result.domain) && (
                        <TableRow key={`${result.domain}-details`}>
                          <TableCell colSpan={5} className="p-0">
                            <div className="p-4 bg-card/90 border-t border-border">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-muted/50">
                                    <TableHead className="text-xs w-12"><span className="sr-only">Select</span></TableHead>
                                    <TableHead className="text-xs">Email Address</TableHead>
                                    <TableHead className="text-xs">Total</TableHead>
                                    <TableHead className="text-xs">Opened %</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {result.individualSenders.map((sender) => {
                                    const isSenderSelected = selectedIndividualSenders.has(sender.email);

                                    return (
                                      <TableRow
                                        key={sender.email}
                                        className="hover:bg-accent/40 transition-colors cursor-pointer"
                                        onClick={() => handleIndividualSenderSelect(sender.email, !isSenderSelected)}
                                      >
                                        <TableCell className="w-12" onClick={(e) => e.stopPropagation()}>
                                          <Checkbox
                                            checked={isSenderSelected}
                                            onCheckedChange={(checked) => handleIndividualSenderSelect(sender.email, checked as boolean)}
                                            className="mr-2 translate-y-[2px] border-2 border-primary"
                                          />
                                        </TableCell>
                                        <TableCell className="text-xs font-medium text-foreground">
                                          {sender.email}
                                          {sender.isMailList && <Newspaper className="h-4 w-4 inline-block mr-1 ml-2 text-primary" />}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">{sender.emailCount}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">{sender.openedPercent.toFixed(0)}%</TableCell>
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
                })}
              </TableBody>
            </Table>
          </div>

          {validSendersCount > 0 && (
            <div className="sticky bottom-4 left-0 right-0 z-30 flex justify-center pt-2 pointer-events-none">
              <div className="pointer-events-auto bg-primary/90 text-secondary-foreground shadow-2xl rounded-full px-6 py-4 flex items-center gap-6 md:gap-8 border border-border backdrop-blur-md animate-in slide-in-from-bottom-6 fade-in duration-300">
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-sm font-medium">
                  <span className="text-background/90">
                    <strong className="text-background text-base">{validSendersCount}</strong> Senders
                  </span>
                  <span className="hidden md:inline text-background/90">•</span>
                  <span className="text-background/90">
                    <strong className="text-background text-base">{uniqueDomains}</strong> Domains
                  </span>
                  <span className="hidden md:inline text-background/90">•</span>
                  <span className="text-background/90">
                    <strong className="text-background text-base">{totalEmails}</strong> Emails
                  </span>
                </div>

                <div className="h-8 w-[1px] bg-background/20 hidden md:block" />

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="destructive" onClick={() => {}}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Trash
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => {}}>
                    <Ban className="h-4 w-4 mr-2" />
                    Trash And Unsubscribe
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="ml-2 rounded-full hover:bg-background/20 text-background"
                    onClick={() => setSelectedIndividualSenders(new Set())}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}