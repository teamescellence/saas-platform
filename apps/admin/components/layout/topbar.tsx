"use client";

import { Bell, Search } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { SidebarTrigger } from "@repo/ui/components/ui/sidebar";
import { Separator } from "@repo/ui/components/ui/separator";
import { BusinessAvatar } from "../ui/business-avatar";
import { MOCK_CURRENT_USER } from "../../lib/mock-data";

export function Topbar() {
  return (
    <header className="flex h-14 items-center gap-3 border-b border-border px-4 bg-card/50 backdrop-blur-sm sticky top-0 z-30">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-5" />

      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <Input
          placeholder="Search..."
          className="pl-8 h-8 text-sm bg-background"
        />
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-4" />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary" />
        </Button>

        {/* User Avatar */}
        <Button variant="ghost" size="icon">
          <BusinessAvatar name={MOCK_CURRENT_USER.name} size="sm" className="size-7" />
        </Button>
      </div>
    </header>
  );
}
