"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/ui/table";
import { format } from "date-fns";
import { BusinessAvatar } from "@repo/ui/components/ui/business-avatar";
import { Badge } from "@repo/ui/components/ui/badge";

export default function AdminUsersPage() {
  const users = [
    { id: "usr_1", name: "Rahul Sharma", email: "rahul@brewbliss.in", role: "owner", created_at: "2026-01-15T10:00:00Z" },
    { id: "usr_2", name: "Priya Verma", email: "priya@brewbliss.in", role: "manager", created_at: "2026-02-10T10:00:00Z" },
    { id: "usr_3", name: "Amit Kumar", email: "amit@brewbliss.in", role: "staff", created_at: "2026-03-15T10:00:00Z" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Registered Users</h1>
          <p className="text-sm text-muted-foreground">Manage SaaS customer registrations and system roles.</p>
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
          <CardDescription>Directory of all registered business accounts and staff</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>SaaS Role</TableHead>
                  <TableHead>Joined Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-semibold flex items-center gap-2.5">
                      <BusinessAvatar name={user.name} size="sm" />
                      <span>{user.name}</span>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(user.created_at), "dd MMM yyyy")}
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
