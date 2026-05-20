"use client";

import Link from "next/link";
import { Plus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your application pipeline, reminders, and interview work for today.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/applications/create">
            <Plus className="mr-2 h-4 w-4" />
            Application
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/contacts/create">
            <UserPlus className="mr-2 h-4 w-4" />
            Contact
          </Link>
        </Button>
      </div>
    </div>
  );
}
