import { Badge } from "@/components/ui/badge";
import type { InterviewMode } from "@/types/interview";

const labels: Record<InterviewMode, string> = {
  PHONE: "Phone",
  VIDEO: "Video",
  ONSITE: "Onsite",
  ONLINE_ASSESSMENT: "OA",
};

export function InterviewModeBadge({ mode }: { mode: InterviewMode }) {
  return <Badge className="whitespace-nowrap">{labels[mode]}</Badge>;
}
