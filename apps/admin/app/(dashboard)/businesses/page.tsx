"use client";

import * as React from "react";
import { MOCK_ADMIN_BUSINESSES, MOCK_PLANS } from "@/lib/mock-data";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Search, Plus, MoreVertical, ShieldAlert, Key, LogIn, Edit, Ban } from "lucide-react";
import { format } from "date-fns";
import { BusinessAvatar } from "@/components/ui/business-avatar";
import Link from "next/link";

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = React.useState(MOCK_ADMIN_BUSINESSES);
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredBusinesses = businesses.filter((biz) =>
    biz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    biz.owner?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    biz.owner?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSuspend = (id: string, name: string) => {
    setBusinesses((prev) =>
      prev.map((b) => (b.id === id ? { ...b, is_active: !b.is_active } : b))
    );
    toast.success(`Account suspension status updated for ${name}.`);
  };

  const handleLoginAs = (name: string) => {
    toast.success(`Simulating login token... Redirecting to dashboard as ${name}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Businesses</h1>
          <p className="text-sm text-muted-foreground">Manage and onboard multi-tenant business accounts.</p>
        </div>
        <Button asChild className="gap-1.5 h-10">
          <Link href="/businesses/new">
            <Plus className="size-4" /> Onboard Business
          </Link>
        </Button>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search business, owner name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Feedbacks</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBusinesses.length > 0 ? (
                  filteredBusinesses.map((biz) => (
                    <TableRow key={biz.id}>
                      <TableCell className="font-semibold flex items-center gap-2.5">
                        <BusinessAvatar name={biz.name} size="sm" />
                        <div className="flex flex-col">
                          <span>{biz.name}</span>
                          <span className="text-[10px] text-primary font-mono lowercase">{biz.slug}.reviewflow.in</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{biz.owner?.name}</span>
                          <span className="text-xs text-muted-foreground">{biz.owner?.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs capitalize">{biz.category.replace("_", " ")}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 border border-primary/20 text-primary uppercase">
                          {biz.plan?.name || "Trial"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                            biz.is_active
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : "bg-red-50 border-red-200 text-red-700"
                          }`}
                        >
                          {biz.is_active ? "Active" : "Suspended"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm font-semibold">{biz.feedback_count}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(biz.created_at), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex shrink-0 items-center justify-center rounded-md text-xs font-medium transition-all outline-none select-none hover:bg-muted hover:text-foreground size-8">
                            <MoreVertical className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleLoginAs(biz.name)}>
                              <LogIn className="size-3.5 mr-2" /> Login as Business
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="size-3.5 mr-2" /> Edit business details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Key className="size-3.5 mr-2" /> Change subscription
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:bg-destructive/10"
                              onClick={() => handleSuspend(biz.id, biz.name)}
                            >
                              <Ban className="size-3.5 mr-2" /> {biz.is_active ? "Suspend Business" : "Activate Business"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No businesses registered.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
