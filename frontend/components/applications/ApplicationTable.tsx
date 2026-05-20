import Link from "next/link";
import { ExternalLink, Trash2 } from "lucide-react";
import { PriorityBadge } from "@/components/applications/PriorityBadge";
import { StatusBadge } from "@/components/applications/StatusBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Application } from "@/types/application";

interface ApplicationTableProps {
  applications?: Application[];
  onDelete?: (id: number) => void;
  deletingId?: number;
  selectedIds?: number[];
  onToggleSelected?: (id: number) => void;
  onToggleAll?: () => void;
}

export function ApplicationTable({
  applications = [],
  onDelete,
  deletingId,
  selectedIds = [],
  onToggleSelected,
  onToggleAll,
}: ApplicationTableProps) {
  const selectedSet = new Set(selectedIds);
  const allSelected = applications.length > 0 && applications.every((application) => selectedSet.has(application.id));
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
                  aria-label="Select all applications"
                  checked={allSelected}
                  onChange={onToggleAll}
                  className="h-4 w-4 rounded border-border"
                />
              </TableHead>
            ) : null}
            <TableHead>Company</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Applied</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.length === 0 ? (
            <TableRow>
              <TableCell colSpan={hasSelection ? 7 : 6} className="h-28 text-center text-muted-foreground">
                No applications yet.
              </TableCell>
            </TableRow>
          ) : (
            applications.map((application) => (
              <TableRow key={application.id}>
                {hasSelection ? (
                  <TableCell>
                    <input
                      type="checkbox"
                      aria-label={`Select ${application.companyName}`}
                      checked={selectedSet.has(application.id)}
                      onChange={() => onToggleSelected?.(application.id)}
                      className="h-4 w-4 rounded border-border"
                    />
                  </TableCell>
                ) : null}
                <TableCell className="min-w-40 font-medium">{application.companyName}</TableCell>
                <TableCell className="min-w-48">
                  <div className="font-medium">{application.role}</div>
                  <div className="text-xs text-muted-foreground">{application.location || "Location not set"}</div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={application.status} />
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={application.priority} />
                </TableCell>
                <TableCell className="whitespace-nowrap">{application.applicationDate}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="outline" size="icon" aria-label="Open application">
                      <Link href={`/applications/${application.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                    {onDelete ? (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        aria-label="Delete application"
                        disabled={deletingId === application.id}
                        onClick={() => onDelete(application.id)}
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
