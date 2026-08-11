"use client";

import * as React from "react";
import { MOCK_ADMIN_BUSINESSES, formatCurrency } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { format } from "date-fns";
import { BusinessAvatar } from "@repo/ui/components/ui/business-avatar";
import { Badge } from "@repo/ui/components/ui/badge";

export default function AdminSubscriptionsPage() {
  const [statusFilter, setStatusFilter] = React.useState("all");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Subscriptions</h1>
          <p className="text-sm text-muted-foreground">Manage active billing subscriptions, trial statuses and MRR contributions.</p>
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue placeholder="Status filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subscriptions</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trial">Free Trial</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Renewal Date</TableHead>
                  <TableHead>AI Usage</TableHead>
                  <TableHead>MRR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_ADMIN_BUSINESSES.map((biz) => {
                  const subStart = new Date(biz.created_at);
                  const renewalDate = new Date(subStart.getTime() + 30 * 24 * 60 * 60 * 1000);

                  return (
                    <TableRow key={biz.id}>
                      <TableCell className="font-semibold flex items-center gap-2.5">
                        <BusinessAvatar name={biz.name} size="sm" />
                        <span>{biz.name}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="uppercase font-mono text-[10px]">
                          {biz.plan?.name || "Growth"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">
                          Active
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(subStart, "dd MMM yyyy")}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(renewalDate, "dd MMM yyyy")}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-foreground">
                        {biz.feedback_count} / {biz.plan?.ai_generation_limit || 2000}
                      </TableCell>
                      <TableCell className="text-sm font-bold text-foreground">
                        {formatCurrency(biz.plan?.price || 999)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
