import Link from "next/link";
import { ExternalLink, Trash2 } from "lucide-react";
import { InterviewModeBadge } from "@/components/interviews/InterviewModeBadge";
import { InterviewResultBadge } from "@/components/interviews/InterviewResultBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { InterviewWithApplication } from "@/types/interview";
import { formatDateTime } from "@/utils/date";

export function InterviewCard({ interview, onDelete, deletingId }: { interview: InterviewWithApplication; onDelete?: (id: number) => void; deletingId?: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium">{interview.roundName}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {interview.companyName ?? "Company not set"} - {interview.role ?? "Role not set"}
            </p>
            <p className="mt-2 text-sm">{formatDateTime(interview.interviewDate)}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button asChild variant="outline" size="icon" aria-label="Open interview">
              <Link href={`/interviews/${interview.id}`}>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
            {onDelete ? (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                aria-label="Delete interview"
                disabled={deletingId === interview.id}
                onClick={() => onDelete(interview.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <InterviewModeBadge mode={interview.mode} />
          <InterviewResultBadge result={interview.result} />
        </div>
        {interview.notes ? <p className="mt-3 text-sm text-muted-foreground">{interview.notes}</p> : null}
      </CardContent>
    </Card>
  );
}
