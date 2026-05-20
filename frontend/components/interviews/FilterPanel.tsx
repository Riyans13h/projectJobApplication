"use client";

import type { InterviewMode, InterviewResult } from "@/types/interview";

const inputLike =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export function FilterPanel({
  result,
  mode,
  onResultChange,
  onModeChange,
}: {
  result: InterviewResult | "";
  mode: InterviewMode | "";
  onResultChange: (value: InterviewResult | "") => void;
  onModeChange: (value: InterviewMode | "") => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <select className={inputLike} value={result} onChange={(event) => onResultChange(event.target.value as InterviewResult | "")}>
        <option value="">All results</option>
        <option value="PENDING">Pending</option>
        <option value="PASSED">Passed</option>
        <option value="REJECTED">Rejected</option>
        <option value="CANCELLED">Cancelled</option>
        <option value="NO_SHOW">No show</option>
      </select>
      <select className={inputLike} value={mode} onChange={(event) => onModeChange(event.target.value as InterviewMode | "")}>
        <option value="">All modes</option>
        <option value="PHONE">Phone</option>
        <option value="VIDEO">Video</option>
        <option value="ONSITE">Onsite</option>
        <option value="ONLINE_ASSESSMENT">Online assessment</option>
      </select>
    </div>
  );
}
