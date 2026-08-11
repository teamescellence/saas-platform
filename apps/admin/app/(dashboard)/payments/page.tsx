"use client";

import * as React from "react";
import { MOCK_ADMIN_PAYMENTS, formatCurrency } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { format } from "date-fns";
import { BusinessAvatar } from "@/components/ui/business-avatar";
import { Badge } from "@repo/ui/components/ui/badge";

export default function AdminPaymentsPage() {
  const [statusFilter, setStatusFilter] = React.useState("all");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Transaction Payments</h1>
          <p className="text-sm text-muted-foreground">Monitor platform payment success rates, invoices, and payouts.</p>
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
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_ADMIN_PAYMENTS.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{payment.id}</TableCell>
                    <TableCell className="font-semibold flex items-center gap-2.5">
                      <BusinessAvatar name={payment.organization?.name || "Spice Garden"} size="sm" />
                      <span>{payment.organization?.name || "Spice Garden"}</span>
                    </TableCell>
                    <TableCell className="text-sm font-bold">{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="uppercase font-mono text-[10px]">
                        {payment.plan?.name || "Growth"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase ${
                          payment.status === "paid"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : payment.status === "pending"
                            ? "bg-amber-50 border-amber-200 text-amber-700"
                            : "bg-red-50 border-red-200 text-red-700"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(payment.created_at), "dd MMM yyyy, hh:mm a")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
