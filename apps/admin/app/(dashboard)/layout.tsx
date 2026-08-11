"use client";

import { SidebarProvider, SidebarInset } from "@repo/ui/components/ui/sidebar";
import { AppSidebar } from "@repo/ui/components/app-sidebar";
import { Topbar } from "../../components/layout/topbar";
import { MOCK_ADMIN_USER } from "../../lib/mock-data";
import {
  LayoutDashboard,
  Building2,
  Users,
  Layers,
  CreditCard,
  Receipt,
  BarChart3,
  QrCode,
  Sparkles,
  Settings,
} from "lucide-react";

const ADMIN_NAV_ITEMS = [
  { title: "Overview", url: "/", icon: LayoutDashboard },
  { title: "Businesses", url: "/businesses", icon: Building2 },
  { title: "Users", url: "/users", icon: Users },
  { title: "Plans", url: "/plans", icon: Layers },
  { title: "Subscriptions", url: "/subscriptions", icon: CreditCard },
  { title: "Payments", url: "/payments", icon: Receipt },
  { title: "Usage", url: "/usage", icon: BarChart3 },
  { title: "QR Codes", url: "/qr-codes", icon: QrCode },
  { title: "AI Usage", url: "/ai-usage", icon: Sparkles },
  { title: "Settings", url: "/settings", icon: Settings },
];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar
        variant="inset"
        user={{
          name: MOCK_ADMIN_USER.name,
          email: MOCK_ADMIN_USER.email,
        }}
        navMain={ADMIN_NAV_ITEMS}
        title="ReviewFlow"
        subtitle="Admin Panel"
      />
      <SidebarInset>
        <Topbar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in-50 duration-200">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
