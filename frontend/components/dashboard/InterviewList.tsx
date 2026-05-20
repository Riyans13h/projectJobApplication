"use client";

import { CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Reminder } from "@/types/dashboard";
import { formatDateTime } from "@/utils/date";

function extractRound(message: string) {
  const [round] = message.split(" interview for ");
  return round || "Interview round";
}

export function InterviewList({ reminders = [], isLoading = false }: { reminders?: Reminder[]; isLoading?: boolean }) {
  const interviews = reminders.filter((reminder) => reminder.type === "UPCOMING_INTERVIEW");

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">Upcoming interviews</h2>
        <p className="text-sm text-muted-foreground">Pending rounds sorted from the reminders feed.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {[0, 1].map((item) => (
            <div key={item} className="rounded-lg border bg-card p-4">
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
              <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : null}

      {!isLoading && interviews.length === 0 ? (
        <p className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">No upcoming interviews scheduled.</p>
      ) : null}

      {!isLoading && interviews.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {interviews.map((interview, index) => (
            <div key={`${interview.interviewId ?? interview.applicationId ?? index}`} className="rounded-lg border bg-card p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                  <CalendarDays className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{interview.companyName ?? "Company not set"}</p>
                      <p className="text-sm text-muted-foreground">{interview.applicationId ? `Application #${interview.applicationId}` : "Role not provided"}</p>
                    </div>
                    {interview.dueDate ? <Badge>{formatDateTime(interview.dueDate)}</Badge> : null}
                  </div>
                  <p className="mt-3 text-sm">
                    <span className="text-muted-foreground">Round:</span> {extractRound(interview.message)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
