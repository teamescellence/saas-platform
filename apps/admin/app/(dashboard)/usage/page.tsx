"use client";

import * as React from "react";
import { MOCK_ADMIN_BUSINESSES, MOCK_USAGE } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { Progress } from "@repo/ui/components/ui/progress";
import { Brain, MessageSquare, QrCode, TrendingUp } from "lucide-react";

export default function AdminUsagePage() {
  const [bizFilter, setBizFilter] = React.useState("all");

  const totalGenerations = 18421;
  const totalFeedback = 31284;
  const totalScans = 45218;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">SaaS Platform Usage</h1>
          <p className="text-sm text-muted-foreground">Monitor aggregate AI resource load and platform metric usage quotas.</p>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total AI Generations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-extrabold flex items-center gap-1.5">
              <Brain className="size-5 text-primary" />
              {totalGenerations.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Across all client workspace profiles</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Feedback Submissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-extrabold flex items-center gap-1.5">
              <MessageSquare className="size-5 text-primary" />
              {totalFeedback.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Collected customer review surveys</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total QR Scans</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-2xl font-extrabold flex items-center gap-1.5">
              <QrCode className="size-5 text-primary" />
              {totalScans.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Customer redirects captured</p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown per business */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Usage Quota Breakdown</CardTitle>
          <CardDescription>Limit metrics consumption details per workspace</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {MOCK_ADMIN_BUSINESSES.map((biz) => {
            const usagePercent = Math.min((biz.feedback_count / (biz.plan?.ai_generation_limit || 2000)) * 100, 100);

            return (
              <div key={biz.id} className="space-y-2 border-b border-border pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span>{biz.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {biz.feedback_count} / {biz.plan?.ai_generation_limit || 2000} AI Generations
                  </span>
                </div>
                <Progress value={usagePercent} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
