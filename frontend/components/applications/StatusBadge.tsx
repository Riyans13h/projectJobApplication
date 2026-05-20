import { Badge } from "@/components/ui/badge";
import type { ApplicationStatus } from "@/types/application";
import { cn } from "@/utils/cn";

const labels: Record<ApplicationStatus, string> = {
  APPLIED: "Applied",
  OA_RECEIVED: "OA received",
  OA_SUBMITTED: "OA submitted",
  INTERVIEW_SCHEDULED: "Interview scheduled",
  INTERVIEW_IN_PROGRESS: "Interviewing",
  INTERVIEW_COMPLETED: "Interview complete",
  OFFER_RECEIVED: "Offer",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
  HOLD: "Hold",
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const tone =
    status === "OFFER_RECEIVED"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
      : status === "REJECTED" || status === "WITHDRAWN"
        ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
        : status.includes("INTERVIEW")
          ? "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300"
          : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300";

  return <Badge className={cn("border", tone)}>{labels[status]}</Badge>;
}
