import Link from "next/link";
import { ExternalLink, Trash2 } from "lucide-react";
import { InterviewModeBadge } from "@/components/interviews/InterviewModeBadge";
import { InterviewResultBadge } from "@/components/interviews/InterviewResultBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { InterviewWithApplication } from "@/types/interview";
import { formatDateTime } from "@/utils/date";

export function InterviewTable({
  interviews = [],
  onDelete,
  deletingId,
  selectedIds = [],
  onToggleSelected,
  onToggleAll,
}: {
  interviews?: InterviewWithApplication[];
  onDelete?: (id: number) => void;
  deletingId?: number;
  selectedIds?: number[];
  onToggleSelected?: (id: number) => void;
  onToggleAll?: () => void;
}) {
  const selectedSet = new Set(selectedIds);
  const allSelected = interviews.length > 0 && interviews.every((interview) => selectedSet.has(interview.id));
  const hasSelection = Boolean(onToggleSelected);

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {hasSelection ? (
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  aria-label="Select all interviews"
                  checked={allSelected}
                  onChange={onToggleAll}
                  className="h-4 w-4 rounded border-border"
                />
              </TableHead>
            ) : null}
            <TableHead>Company</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Round</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Mode</TableHead>
            <TableHead>Result</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {interviews.length === 0 ? (
            <TableRow>
              <TableCell colSpan={hasSelection ? 8 : 7} className="h-28 text-center text-muted-foreground">
                No interviews found.
              </TableCell>
            </TableRow>
          ) : (
            interviews.map((interview) => (
              <TableRow key={interview.id}>
                {hasSelection ? (
                  <TableCell>
                    <input
                      type="checkbox"
                      aria-label={`Select ${interview.roundName}`}
                      checked={selectedSet.has(interview.id)}
                      onChange={() => onToggleSelected?.(interview.id)}
                      className="h-4 w-4 rounded border-border"
                    />
                  </TableCell>
                ) : null}
                <TableCell className="min-w-40 font-medium">{interview.companyName ?? "Company not set"}</TableCell>
                <TableCell className="min-w-40">{interview.role ?? "Role not set"}</TableCell>
                <TableCell className="min-w-44">{interview.roundName}</TableCell>
                <TableCell className="whitespace-nowrap">{formatDateTime(interview.interviewDate)}</TableCell>
                <TableCell>
                  <InterviewModeBadge mode={interview.mode} />
                </TableCell>
                <TableCell>
                  <InterviewResultBadge result={interview.result} />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
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
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
