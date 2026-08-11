"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Receipt,
  BarChart3,
  QrCode,
  Sparkles,
  Settings,
  Layers,
  Star,
} from "lucide-react";
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
import { BusinessAvatar } from "../ui/business-avatar";
import { MOCK_ADMIN_USER } from "../../lib/mock-data";

const ADMIN_NAV_ITEMS = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Businesses", href: "/businesses", icon: Building2 },
  { label: "Users", href: "/users", icon: Users },
  { label: "Plans", href: "/plans", icon: Layers },
  { label: "Subscriptions", href: "/subscriptions", icon: CreditCard },
  { label: "Payments", href: "/payments", icon: Receipt },
  { label: "Usage", href: "/usage", icon: BarChart3 },
  { label: "QR Codes", href: "/qr-codes", icon: QrCode },
  { label: "AI Usage", href: "/ai-usage", icon: Sparkles },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
            <Star className="size-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-foreground">ReviewFlow</span>
            <span className="text-[10px] font-semibold text-primary uppercase tracking-widest">Admin</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {ADMIN_NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
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
          <SidebarMenuItem>
            <SidebarMenuButton className="h-auto py-2">
              <div className="flex items-center gap-2.5 w-full">
                <BusinessAvatar name={MOCK_ADMIN_USER.name} size="sm" />
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium truncate">{MOCK_ADMIN_USER.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{MOCK_ADMIN_USER.email}</p>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
