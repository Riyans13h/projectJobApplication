"use client";

import { Button } from "@/components/ui/button";
import type { ContactStatus, ContactType, HelpScore } from "@/types/contact";

const contactTypes: Array<{ value: ContactType | ""; label: string }> = [
  { value: "", label: "All types" },
  { value: "REFERRAL", label: "Referral" },
  { value: "RECRUITER", label: "Recruiter" },
  { value: "HR", label: "HR" },
  { value: "HIRING_MANAGER", label: "Hiring manager" },
  { value: "MENTOR", label: "Mentor" },
  { value: "COLD_MAIL", label: "Cold mail" },
  { value: "ALUMNI", label: "Alumni" },
  { value: "FRIEND", label: "Friend" },
];

const statuses: Array<{ value: ContactStatus | ""; label: string }> = [
  { value: "", label: "All statuses" },
  { value: "NOT_CONTACTED", label: "Not contacted" },
  { value: "MESSAGE_SENT", label: "Message sent" },
  { value: "RESPONDED", label: "Responded" },
  { value: "REFERRAL_GIVEN", label: "Referral given" },
  { value: "REJECTED", label: "Rejected" },
  { value: "FOLLOW_UP_NEEDED", label: "Follow-up needed" },
];

const helpScores: Array<{ value: HelpScore | ""; label: string }> = [
  { value: "", label: "All help scores" },
  { value: "ZERO", label: "0 / 10" },
  { value: "ONE", label: "1 / 10" },
  { value: "TWO", label: "2 / 10" },
  { value: "THREE", label: "3 / 10" },
  { value: "FOUR", label: "4 / 10" },
  { value: "FIVE", label: "5 / 10" },
  { value: "SIX", label: "6 / 10" },
  { value: "SEVEN", label: "7 / 10" },
  { value: "EIGHT", label: "8 / 10" },
  { value: "NINE", label: "9 / 10" },
  { value: "TEN", label: "10 / 10" },
];

interface FilterPanelProps {
  contactType: ContactType | "";
  status: ContactStatus | "";
  helpScore: HelpScore | "";
  onContactTypeChange: (value: ContactType | "") => void;
  onStatusChange: (value: ContactStatus | "") => void;
  onHelpScoreChange: (value: HelpScore | "") => void;
  onClear: () => void;
}

export function FilterPanel({
  contactType,
  status,
  helpScore,
  onContactTypeChange,
  onStatusChange,
  onHelpScoreChange,
  onClear,
}: FilterPanelProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="grid flex-1 gap-3 sm:grid-cols-3">
        <select
          value={contactType}
          onChange={(event) => onContactTypeChange(event.target.value as ContactType | "")}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {contactTypes.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(event) => onStatusChange(event.target.value as ContactStatus | "")}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {statuses.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={helpScore}
          onChange={(event) => onHelpScoreChange(event.target.value as HelpScore | "")}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {helpScores.map((option) => (
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
