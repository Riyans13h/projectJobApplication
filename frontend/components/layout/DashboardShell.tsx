"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/utils/cn";

export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isAuthenticated, mounted, router]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="hidden fixed inset-y-0 left-0 z-40 md:block">
        <Sidebar />
      </div>
      <div className={cn("fixed inset-0 z-50 md:hidden", !mobileOpen && "pointer-events-none")}>
        <div
          className={cn("absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity", mobileOpen ? "opacity-100" : "opacity-0")}
          onClick={() => setMobileOpen(false)}
        />
        <div className={cn("absolute inset-y-0 left-0 transition-transform", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </div>
      </div>
      <div className="min-w-0 md:pl-64">
        <Navbar onMenuClick={() => setMobileOpen(true)} />
        <main className="min-w-0 overflow-x-hidden p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
