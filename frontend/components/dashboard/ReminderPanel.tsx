"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { ReminderCard } from "@/components/dashboard/ReminderCard";
import { Button } from "@/components/ui/button";
import type { Reminder } from "@/types/dashboard";

function ReminderSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="rounded-lg border bg-card p-4">
          <div className="flex gap-3">
            <div className="h-9 w-9 animate-pulse rounded-md bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReminderPanel({
  reminders = [],
  isLoading = false,
  isError = false,
  open = false,
  onOpenChange,
  onDelete,
  selectionMode = false,
  selectedKeys = [],
  getReminderKey,
  onSelectionModeChange,
  onToggleSelected,
  onDeleteSelected,
}: {
  reminders?: Reminder[];
  isLoading?: boolean;
  isError?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onDelete?: (reminder: Reminder) => void;
  selectionMode?: boolean;
  selectedKeys?: string[];
  getReminderKey?: (reminder: Reminder) => string;
  onSelectionModeChange?: (enabled: boolean) => void;
  onToggleSelected?: (reminder: Reminder) => void;
  onDeleteSelected?: () => void;
}) {
  const Icon = open ? ChevronDown : ChevronRight;
  const selectedSet = new Set(selectedKeys);

  return (
    <section className="min-w-0 space-y-3">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2 text-left"
        onClick={() => onOpenChange?.(!open)}
      >
        <div>
          <h2 className="text-sm font-semibold">Reminders</h2>
          <p className="text-xs text-muted-foreground">Click to open alerts.</p>
        </div>
        <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
      </button>

      {open ? (
        <>
          {isLoading ? <ReminderSkeleton /> : null}
          {isError ? <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">Could not load reminders.</p> : null}
          {!isLoading && !isError && reminders.length === 0 ? (
            <p className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">Nothing pending.</p>
          ) : null}
          {!isLoading && !isError && reminders.length > 0 ? (
            <div className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-xs">
              <span className="text-muted-foreground">
                {selectionMode ? `${selectedKeys.length} selected` : "Delete one by one or select multiple."}
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={selectionMode ? "secondary" : "outline"}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => onSelectionModeChange?.(!selectionMode)}
                >
                  {selectionMode ? "Done" : "Select"}
                </Button>
                {selectionMode ? (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    disabled={selectedKeys.length === 0}
                    onClick={onDeleteSelected}
                  >
                    Delete selected
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
          {!isLoading && !isError && reminders.length > 0 ? (
            <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {reminders.map((reminder, index) => (
                <ReminderCard
                  key={`${reminder.type}-${reminder.applicationId ?? reminder.contactId ?? reminder.interviewId ?? index}`}
                  reminder={reminder}
                  onDelete={onDelete}
                  selected={getReminderKey ? selectedSet.has(getReminderKey(reminder)) : false}
                  onToggleSelected={selectionMode ? onToggleSelected : undefined}
                />
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
