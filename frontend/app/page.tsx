"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader } from "@/components/ui/loader";
import { useAuthStore } from "@/store/auth.store";

export default function HomePage() {
  const router = useRouter();
  const { hasHydrated, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    router.replace(isAuthenticated ? "/dashboard" : "/auth/login");
  }, [hasHydrated, isAuthenticated, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <Loader />
    </main>
  );
}
