"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Star,
  MessageSquare,
  QrCode,
  BarChart3,
  Users,
  Building2,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@repo/ui/components/ui/sidebar";
import { BusinessAvatar } from "@/components/ui/business-avatar";
import { MOCK_CURRENT_USER, MOCK_BUSINESS } from "@/lib/mock-data";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Reviews", href: "/dashboard/reviews", icon: Star },
  { label: "Feedback", href: "/dashboard/feedback", icon: MessageSquare },
  { label: "QR Codes", href: "/dashboard/qr-codes", icon: QrCode },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Team", href: "/dashboard/team", icon: Users },
  { label: "Business Profile", href: "/dashboard/business", icon: Building2 },
  { label: "Subscription", href: "/dashboard/subscription", icon: CreditCard },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

const FOOTER_ITEMS = [
  { label: "Help", href: "/dashboard/help", icon: HelpCircle },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
            <Star className="size-4 text-primary-foreground" />
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">ReviewFlow</span>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarMenu>
          {FOOTER_ITEMS.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild>
                <Link href={item.href}>
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarSeparator className="my-2" />
          <SidebarMenuItem>
            <SidebarMenuButton className="h-auto py-2">
              <div className="flex items-center gap-2.5 w-full">
                <BusinessAvatar name={MOCK_CURRENT_USER.name} size="sm" />
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium truncate">{MOCK_CURRENT_USER.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{MOCK_CURRENT_USER.email}</p>
                </div>
                <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
