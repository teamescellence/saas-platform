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

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar
        variant="inset"
        user={{
          name: MOCK_ADMIN_USER.name,
          email: MOCK_ADMIN_USER.email,
        }}
        navItems={ADMIN_NAV_ITEMS}
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
