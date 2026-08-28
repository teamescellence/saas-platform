"use client";

import * as React from "react";
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
import { Users, UserPlus, MoreVertical, Shield, Trash2, Mail, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { BusinessAvatar } from "@/components/ui/business-avatar";
import { useQuery } from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";

export default function TeamPage() {
  const { data: dbTeam = [], isLoading } = useQuery<any[]>({
    queryKey: ["team"],
    queryFn: () => api.get<any[]>(endpoints.team),
  });

  const [team, setTeam] = React.useState<any[]>([]);
  const [inviteOpen, setInviteOpen] = React.useState(false);

  // Sync team state when query completes
  React.useEffect(() => {
    if (dbTeam.length > 0) {
      setTeam(dbTeam);
    }
  }, [dbTeam]);

  // Invite states
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<"owner" | "manager" | "staff">("staff");

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const newMember = {
      id: `tm_${Date.now()}`,
      user: {
        id: `usr_${Date.now()}`,
        name: email.split("@")[0],
        email,
        role: role === "owner" ? "owner" : role === "manager" ? "manager" : "staff",
      },
      role,
      status: "invited",
      joined_at: new Date().toISOString(),
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

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
          <CardDescription>Configure user roles and manage dashboard control</CardDescription>
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
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-semibold flex items-center gap-2.5">
                      <BusinessAvatar name={member.user?.name || "Member"} size="sm" />
                      <span>{member.user?.name || "Team Member"}</span>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{member.user?.email || "—"}</TableCell>
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
                      {member.joined_at
                        ? formatDistanceToNow(new Date(member.joined_at), { addSuffix: true })
                        : "Active"}
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
                              onClick={() => handleRemove(member.id, member.user?.name)}
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
                    placeholder="e.g. employee@business.in"
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
