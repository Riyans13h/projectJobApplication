import { Badge } from "@/components/ui/badge";
import type { Priority } from "@/types/application";
import { cn } from "@/utils/cn";

const labels: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

const tones: Record<Priority, string> = {
  LOW: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
  MEDIUM: "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-300",
  HIGH: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  CRITICAL: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge className={cn("border", tones[priority])}>{labels[priority]}</Badge>;
}
