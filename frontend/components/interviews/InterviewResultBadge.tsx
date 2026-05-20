import { Badge } from "@/components/ui/badge";
import type { InterviewResult } from "@/types/interview";
import { cn } from "@/utils/cn";

const labels: Record<InterviewResult, string> = {
  PENDING: "Pending",
  PASSED: "Passed",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  NO_SHOW: "No show",
};

const styles: Record<InterviewResult, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  PASSED: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  REJECTED: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300",
  CANCELLED: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
  NO_SHOW: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300",
};

export function InterviewResultBadge({ result }: { result: InterviewResult }) {
  return <Badge className={cn("whitespace-nowrap", styles[result])}>{labels[result]}</Badge>;
}
