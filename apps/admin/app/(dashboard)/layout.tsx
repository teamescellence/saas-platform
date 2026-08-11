import { SidebarProvider } from "@repo/ui/components/ui/sidebar";
import { AdminSidebar } from "../../components/layout/admin-sidebar";
import { Topbar } from "../../components/layout/topbar";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <Topbar />
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in-50 duration-200">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
