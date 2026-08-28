"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";
import { MOCK_PLANS, MOCK_PAYMENTS, formatCurrency } from "@/lib/mock-data";
import { PlanCard } from "@/components/ui/plan-card";
import { UsageProgress } from "@/components/ui/usage-progress";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@repo/ui/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/ui/table";
import { toast } from "sonner";
import { CreditCard, Download, CheckCircle2, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function SubscriptionPage() {
  const { data: sub, isLoading } = useQuery<any>({
    queryKey: ["subscription"],
    queryFn: () => api.get(endpoints.subscription),
  });

  const currentPlan = sub?.plan || {
    name: "Growth Plan",
    slug: "growth",
    price: 1999,
  };

  const usage = sub?.usage || {
    ai_generations: { current: 0, limit: 2500 },
    feedback: { current: 0, limit: 2500 },
    qr_codes: { current: 0, limit: 25 },
    branches: { current: 0, limit: 5 },
  };

  const handleManageBilling = () => {
    toast.info("Subscription management portal will open in a new tab.");
  };

  const handleDownloadInvoice = (invNum?: string) => {
    toast.success(`Downloading invoice ${invNum || "INV-X"}...`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Subscription & Quotas</h1>
        <p className="text-sm text-muted-foreground">Manage your SaaS billing settings, plan quotas and usage metering.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Plan Quota Limits */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Plan Usage Quotas</CardTitle>
                <CardDescription>Live limits allocated to your {currentPlan.name}</CardDescription>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="size-3.5" /> Active Plan
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <UsageProgress label="AI Generations" current={usage.ai_generations.current} limit={usage.ai_generations.limit} />
            <UsageProgress label="Feedback Submissions" current={usage.feedback.current} limit={usage.feedback.limit} />
            <UsageProgress label="QR Codes Locations" current={usage.qr_codes.current} limit={usage.qr_codes.limit} />
            <UsageProgress label="Active Branches" current={usage.branches.current} limit={usage.branches.limit} />
          </CardContent>
          <CardFooter className="bg-muted/20 border-t border-border/50 p-4 flex justify-between items-center text-xs text-muted-foreground">
            <span>Billing cycle active ({sub?.ends_at ? `Renews on ${format(new Date(sub.ends_at), "dd MMM yyyy")}` : "Renews monthly"})</span>
            <Button size="sm" onClick={handleManageBilling} className="gap-1.5 h-8">
              <CreditCard className="size-3.5" /> Manage Billing
            </Button>
          </CardFooter>
        </Card>

        {/* Current Plan Summary Card */}
        <Card className="border-border/50 h-fit bg-gradient-to-b from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-base font-bold">Your Active Plan</CardTitle>
            <CardDescription>Details of your business tier</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-foreground">{currentPlan.name}</h3>
              <p className="text-sm text-muted-foreground">All core AI review generation and multi-branch features enabled</p>
            </div>
            <div className="flex items-baseline gap-1 border-t border-border pt-4">
              <span className="text-3xl font-extrabold">{formatCurrency(currentPlan.price || 0)}</span>
              <span className="text-sm text-muted-foreground">/ month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Comparisons */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>Upgrade to expand limits and unlock white-label review kits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_PLANS.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrentPlan={plan.slug === currentPlan.slug}
                onSelect={(p) => toast.info(`Upgrading to ${p.name} plan...`)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invoice History */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Download past transaction receipts</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Billing Date</TableHead>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_PAYMENTS.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="text-sm font-medium">
                    {format(new Date(payment.created_at), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{payment.invoice_number}</TableCell>
                  <TableCell className="text-sm font-semibold">{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 uppercase">
                      {payment.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="size-8" onClick={() => handleDownloadInvoice(payment.invoice_number)}>
                      <Download className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
