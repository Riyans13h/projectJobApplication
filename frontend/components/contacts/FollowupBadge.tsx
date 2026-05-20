import { Badge } from "@/components/ui/badge";
import type { ContactStatus } from "@/types/contact";
import { cn } from "@/utils/cn";

const labels: Record<ContactStatus, string> = {
  NOT_CONTACTED: "Not contacted",
  MESSAGE_SENT: "Message sent",
  RESPONDED: "Responded",
  REFERRAL_GIVEN: "Referral given",
  REJECTED: "Rejected",
  FOLLOW_UP_NEEDED: "Follow-up needed",
};

export function FollowupBadge({ status }: { status: ContactStatus }) {
  const tone =
    status === "REFERRAL_GIVEN" || status === "RESPONDED"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
      : status === "REJECTED"
        ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
        : status === "FOLLOW_UP_NEEDED"
          ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300"
          : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300";

  return <Badge className={cn("border", tone)}>{labels[status]}</Badge>;
}
