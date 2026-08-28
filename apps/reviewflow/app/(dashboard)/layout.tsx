"use client";

import { SidebarProvider, SidebarInset } from "@repo/ui/components/ui/sidebar";
import { AppSidebar } from "@repo/ui/components/app-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useQuery } from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
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
} from "lucide-react";

const NAV_ITEMS = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "Reviews", url: "/dashboard/reviews", icon: Star },
  { title: "Feedback", url: "/dashboard/feedback", icon: MessageSquare },
  { title: "QR Codes", url: "/dashboard/qr-codes", icon: QrCode },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
  { title: "Team", url: "/dashboard/team", icon: Users },
  { title: "Business Profile", url: "/dashboard/business", icon: Building2 },
  { title: "Subscription", url: "/dashboard/subscription", icon: CreditCard },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  const { data: business } = useQuery<any>({
    queryKey: ["business"],
    queryFn: () => api.get<any>(endpoints.business),
    enabled: !!user,
  });

  const { data: dbBranches = [] } = useQuery<any[]>({
    queryKey: ["branches"],
    queryFn: () => api.get<any[]>(endpoints.branches),
    enabled: !!user,
  });

  const branches = dbBranches.length > 0
    ? dbBranches.map((b) => ({
        name: b.name,
        logo: Building2,
        plan: b.is_active ? "Active Branch" : "Inactive",
      }))
    : [
        {
          name: business?.name ? `${business.name} (Main)` : "Main Location",
          logo: Building2,
          plan: "Active Branch",
        },
      ];

  return (
    <SidebarProvider>
      <AppSidebar
        user={{
          name: user?.name || "Account Owner",
          email: user?.email || "owner@business.in",
        }}
        teams={branches}
        navMain={NAV_ITEMS}
        title={business?.name || "ReviewFlow"}
        subtitle="Owner Portal"
        onLogout={logout}
      />
      <SidebarInset className="flex flex-col flex-1 min-w-0">
        <Topbar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in-50 duration-200">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
