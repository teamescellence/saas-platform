"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/ui/table";
import { Brain, MessageCircle, AlertTriangle } from "lucide-react";
import { Progress } from "@repo/ui/components/ui/progress";

export default function AdminAiUsagePage() {
  const [model, setModel] = React.useState("gemini-1.5-flash");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">AI Token & Model Usage</h1>
          <p className="text-sm text-muted-foreground">Monitor API tokens consumed by the ReviewFlow AI Assistant.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Model Allocation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-xl font-bold flex items-center gap-1.5">
              <Brain className="size-5 text-primary" />
              Gemini Flash 3.5
            </div>
            <p className="text-xs text-muted-foreground">Primary review generation engine</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Generation Time</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-xl font-bold">420 ms</div>
            <p className="text-xs text-muted-foreground">Average API server latency</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Token Error Rate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-emerald-600">
            <div className="text-xl font-bold">0.02%</div>
            <p className="text-xs text-muted-foreground">Success requests ratio</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Token Usage Distribution</CardTitle>
          <CardDescription>Estimated tokens usage breakdown by billing tier</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span>Growth Plan (78% of traffic)</span>
              <span>1.2M tokens</span>
            </div>
            <Progress value={78} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span>Pro Plan (15% of traffic)</span>
              <span>450k tokens</span>
            </div>
            <Progress value={15} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span>Starter Plan (7% of traffic)</span>
              <span>120k tokens</span>
            </div>
            <Progress value={7} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
