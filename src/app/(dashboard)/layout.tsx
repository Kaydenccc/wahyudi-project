"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { SessionProvider } from "@/hooks/use-session";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen">
        {/* Sidebar - hidden on mobile */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        {/* Main content */}
        <div className="lg:pl-64">
          <Topbar />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
