"use client";

import { AlertTriangle, BriefcaseBusiness, Clock3, Hourglass, MessageSquareMore, Percent, Send, Trophy, XCircle } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import type { DashboardStats } from "@/types/dashboard";

const fallback: DashboardStats = {
  totalApplications: 0,
  activeApplications: 0,
  oaPending: 0,
  interviewsScheduled: 0,
  interviewsCompleted: 0,
  offersReceived: 0,
  rejectedCount: 0,
  rejectionRate: 0,
  activeCooldowns: 0,
  pendingFollowups: 0,
};

export function StatsGrid({ stats = fallback, isLoading = false }: { stats?: DashboardStats; isLoading?: boolean }) {
  const items = [
    { label: "Total applications", value: stats.totalApplications, icon: BriefcaseBusiness, tone: "blue" as const },
    { label: "Active applications", value: stats.activeApplications, icon: Clock3, tone: "green" as const },
    { label: "OA pending", value: stats.oaPending, icon: Send, tone: "amber" as const },
    { label: "Interviews scheduled", value: stats.interviewsScheduled, icon: MessageSquareMore, tone: "violet" as const },
    { label: "Offers received", value: stats.offersReceived, icon: Trophy, tone: "green" as const },
    { label: "Rejected", value: stats.rejectedCount, icon: XCircle, tone: "red" as const },
    { label: "Rejection rate", value: `${stats.rejectionRate.toFixed(1)}%`, icon: Percent, tone: "slate" as const },
    { label: "Active cooldowns", value: stats.activeCooldowns, icon: Hourglass, tone: "amber" as const },
    { label: "Pending follow-ups", value: stats.pendingFollowups, icon: AlertTriangle, tone: "red" as const },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <StatsCard key={item.label} {...item} isLoading={isLoading} />
      ))}
    </div>
  );
}
