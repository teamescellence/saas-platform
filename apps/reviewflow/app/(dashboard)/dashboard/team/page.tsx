"use client";

import * as React from "react";
import { MOCK_TEAM } from "@/lib/mock-data";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@repo/ui/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Plus, Users, UserPlus, MoreVertical, Shield, Trash2, Mail, ShieldAlert } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { BusinessAvatar } from "@/components/ui/business-avatar";
import type { TeamMember } from "@/lib/types";

export default function TeamPage() {
  const [team, setTeam] = React.useState<TeamMember[]>(MOCK_TEAM);
  const [inviteOpen, setInviteOpen] = React.useState(false);

  // Invite states
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<"owner" | "manager" | "staff">("staff");

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const newMember: TeamMember = {
      id: `tm_${Date.now()}`,
      user_id: `usr_${Date.now()}`,
      organization_id: "org_1",
      user: {
        id: `usr_${Date.now()}`,
        name: email.split("@")[0],
        email,
        role: role === "owner" ? "owner" : role === "manager" ? "manager" : "staff",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      role,
      status: "invited",
    };

    setTeam((prev) => [...prev, newMember]);
    setEmail("");
    setRole("staff");
    setInviteOpen(false);
    toast.success(`Invitation sent to ${email}!`);
  };

  const handleRemove = (id: string, name: string) => {
    setTeam((prev) => prev.filter((tm) => tm.id !== id));
    toast.success(`Removed ${name} from the team.`);
  };

  const handleRoleChange = (id: string, newRole: "owner" | "manager" | "staff") => {
    setTeam((prev) =>
      prev.map((tm) => (tm.id === id ? { ...tm, role: newRole } : tm))
    );
    toast.success("Role updated successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Team Management</h1>
          <p className="text-sm text-muted-foreground">Manage access roles, team members, and branch permissions.</p>
        </div>
        <Button onClick={() => setInviteOpen(true)} className="gap-1.5 h-10">
          <UserPlus className="size-4" /> Invite Member
        </Button>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-1.5">
            <Users className="size-4.5 text-primary" /> Active Team Members
          </CardTitle>
          <CardDescription>Configure user roles and manage access dashboard control</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-semibold flex items-center gap-2.5">
                      <BusinessAvatar name={member.user.name} size="sm" />
                      <span>{member.user.name}</span>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{member.user.email}</TableCell>
                    <TableCell className="text-xs font-semibold capitalize flex items-center gap-1 py-4">
                      <Shield className="size-3.5 text-primary" />
                      {member.role}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                          member.status === "active"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : member.status === "invited"
                            ? "bg-amber-50 border-amber-200 text-amber-700 animate-pulse"
                            : "bg-slate-50 border-slate-200 text-slate-600"
                        }`}
                      >
                        {member.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {member.last_active_at
                        ? formatDistanceToNow(new Date(member.last_active_at), { addSuffix: true })
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      {member.role !== "owner" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex shrink-0 items-center justify-center rounded-md text-xs font-medium transition-all outline-none select-none hover:bg-muted hover:text-foreground size-8">
                            <MoreVertical className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Manage permissions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleRoleChange(member.id, "manager")}>
                              Make Manager
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRoleChange(member.id, "staff")}>
                              Make Staff
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:bg-destructive/10"
                              onClick={() => handleRemove(member.id, member.user.name)}
                            >
                              <Trash2 className="size-3.5 mr-2" /> Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Invite Modal */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Enter their email address and assign a system dashboard role.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInvite}>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="invite-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="invite-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. employee@brewbliss.in"
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invite-role">Assign Role</Label>
                <Select value={role} onValueChange={(val: any) => setRole(val)}>
                  <SelectTrigger id="invite-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Manager (Full dashboard control)</SelectItem>
                    <SelectItem value="staff">Staff (Reviews and Feedback views only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Send Invitation</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
