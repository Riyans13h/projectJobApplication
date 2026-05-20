"use client";

import { Button } from "@/components/ui/button";
import type { ApplicationStatus, Priority } from "@/types/application";

const statuses: Array<{ value: ApplicationStatus | ""; label: string }> = [
  { value: "", label: "All statuses" },
  { value: "APPLIED", label: "Applied" },
  { value: "OA_RECEIVED", label: "OA received" },
  { value: "OA_SUBMITTED", label: "OA submitted" },
  { value: "INTERVIEW_SCHEDULED", label: "Interview scheduled" },
  { value: "INTERVIEW_IN_PROGRESS", label: "Interviewing" },
  { value: "INTERVIEW_COMPLETED", label: "Interview complete" },
  { value: "OFFER_RECEIVED", label: "Offer" },
  { value: "REJECTED", label: "Rejected" },
  { value: "WITHDRAWN", label: "Withdrawn" },
  { value: "HOLD", label: "Hold" },
];

const priorities: Array<{ value: Priority | ""; label: string }> = [
  { value: "", label: "All priorities" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

interface FilterPanelProps {
  status: ApplicationStatus | "";
  priority: Priority | "";
  onStatusChange: (value: ApplicationStatus | "") => void;
  onPriorityChange: (value: Priority | "") => void;
  onClear: () => void;
}

export function FilterPanel({ status, priority, onStatusChange, onPriorityChange, onClear }: FilterPanelProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 md:flex-row md:items-center md:justify-between">
      <div className="grid flex-1 gap-3 sm:grid-cols-2">
        <select
          value={status}
          onChange={(event) => onStatusChange(event.target.value as ApplicationStatus | "")}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {statuses.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(event) => onPriorityChange(event.target.value as Priority | "")}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {priorities.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <Button type="button" variant="outline" onClick={onClear}>
        Clear
      </Button>
    </div>
  );
}
