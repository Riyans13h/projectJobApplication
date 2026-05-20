"use client";

import { AlarmClock, CalendarClock, Hourglass } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Reminder } from "@/types/dashboard";
import { formatDateTime } from "@/utils/date";

const icons = {
  UPCOMING_INTERVIEW: CalendarClock,
  PENDING_FOLLOWUP: AlarmClock,
  ACTIVE_COOLDOWN: Hourglass,
};

function reminderLabel(type: string) {
  return type.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function ReminderCard({
  reminder,
  onDelete,
  selected = false,
  onToggleSelected,
}: {
  reminder: Reminder;
  onDelete?: (reminder: Reminder) => void;
  selected?: boolean;
  onToggleSelected?: (reminder: Reminder) => void;
}) {
  const Icon = icons[reminder.type as keyof typeof icons] ?? AlarmClock;

  return (
    <Card>
      <CardContent className="p-2.5">
        <div className="flex items-start gap-2">
          {onToggleSelected ? (
            <input
              type="checkbox"
              aria-label={`Select reminder ${reminder.title}`}
              checked={selected}
              onChange={() => onToggleSelected(reminder)}
              className="mt-1 h-4 w-4 shrink-0 rounded border-border"
            />
          ) : null}
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            <Icon className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="break-words text-sm font-medium leading-5">{reminder.title}</p>
                <p className="mt-0.5 line-clamp-1 break-words text-xs text-muted-foreground">{reminder.message}</p>
                {reminder.dueDate ? <p className="mt-0.5 text-xs text-muted-foreground">Due {formatDateTime(reminder.dueDate)}</p> : null}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Badge>{reminderLabel(reminder.type)}</Badge>
                {onDelete ? (
                  <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => onDelete(reminder)}>
                    Delete
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
