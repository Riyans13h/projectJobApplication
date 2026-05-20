import { Badge } from "@/components/ui/badge";
import type { ContactType } from "@/types/contact";
import { cn } from "@/utils/cn";

const labels: Record<ContactType, string> = {
  REFERRAL: "Referral",
  RECRUITER: "Recruiter",
  HR: "HR",
  HIRING_MANAGER: "Hiring manager",
  MENTOR: "Mentor",
  COLD_MAIL: "Cold mail",
  ALUMNI: "Alumni",
  FRIEND: "Friend",
};

export function ContactTypeBadge({ contactType }: { contactType: ContactType }) {
  return <Badge className={cn("border border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300")}>{labels[contactType]}</Badge>;
}
