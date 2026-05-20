"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { InterviewList } from "@/components/dashboard/InterviewList";
import { ReminderPanel } from "@/components/dashboard/ReminderPanel";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { dashboardService } from "@/services/dashboard.service";
import type { Reminder, TimelineEvent } from "@/types/dashboard";

const dismissedReminderStorageKey = "jobflow-dismissed-reminders";

type DeleteRequest =
  | { type: "activity"; item: TimelineEvent }
  | { type: "activities"; ids: number[] }
  | { type: "reminder"; reminder: Reminder }
  | { type: "reminders"; reminders: Reminder[] }
  | null;

function reminderKey(reminder: Reminder) {
  return [
    reminder.type,
    reminder.applicationId ?? "no-app",
    reminder.interviewId ?? "no-interview",
    reminder.contactId ?? "no-contact",
    reminder.companyName ?? "no-company",
    reminder.dueDate ?? "no-date",
    reminder.message,
  ].join("|");
}

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [activityOpen, setActivityOpen] = useState(false);
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [activitySelectionMode, setActivitySelectionMode] = useState(false);
  const [reminderSelectionMode, setReminderSelectionMode] = useState(false);
  const [selectedActivityIds, setSelectedActivityIds] = useState<number[]>([]);
  const [selectedReminderKeys, setSelectedReminderKeys] = useState<string[]>([]);
  const [deleteRequest, setDeleteRequest] = useState<DeleteRequest>(null);
  const [dismissedReminderKeys, setDismissedReminderKeys] = useState<string[]>([]);

  const stats = useQuery({ queryKey: ["dashboard", "stats"], queryFn: dashboardService.stats });
  const activity = useQuery({ queryKey: ["dashboard", "activity"], queryFn: () => dashboardService.activity(0, 8) });
  const reminders = useQuery({ queryKey: ["dashboard", "reminders"], queryFn: dashboardService.reminders });

  useEffect(() => {
    const stored = window.localStorage.getItem(dismissedReminderStorageKey);
    if (stored) {
      setDismissedReminderKeys(JSON.parse(stored) as string[]);
    }
  }, []);

  const visibleReminders = useMemo(() => {
    const dismissed = new Set(dismissedReminderKeys);
    return (reminders.data ?? []).filter((reminder) => !dismissed.has(reminderKey(reminder)));
  }, [dismissedReminderKeys, reminders.data]);

  const deleteActivity = useMutation({
    mutationFn: async (ids: number[]) => {
      for (const id of ids) {
        await dashboardService.deleteActivity(id);
      }
    },
    onSuccess: async () => {
      setSelectedActivityIds([]);
      setDeleteRequest(null);
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "activity"] });
    },
  });

  const dismissReminders = (remindersToDismiss: Reminder[]) => {
    const next = Array.from(new Set([...dismissedReminderKeys, ...remindersToDismiss.map(reminderKey)]));
    setDismissedReminderKeys(next);
    window.localStorage.setItem(dismissedReminderStorageKey, JSON.stringify(next));
    setSelectedReminderKeys([]);
    setDeleteRequest(null);
  };

  const toggleSelectedActivity = (item: TimelineEvent) => {
    setSelectedActivityIds((current) => (current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id]));
  };

  const toggleSelectedReminder = (reminder: Reminder) => {
    const key = reminderKey(reminder);
    setSelectedReminderKeys((current) => (current.includes(key) ? current.filter((selectedKey) => selectedKey !== key) : [...current, key]));
  };

  const selectedReminders = visibleReminders.filter((reminder) => selectedReminderKeys.includes(reminderKey(reminder)));

  return (
    <DashboardShell>
      <DashboardHeader />

      <div className="min-w-0 space-y-8">
        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
          <div className="min-w-0">
            <ActivityFeed
              items={activity.data?.content}
              isLoading={activity.isLoading}
              isError={activity.isError}
              open={activityOpen}
              onOpenChange={setActivityOpen}
              onDelete={(item) => setDeleteRequest({ type: "activity", item })}
              selectionMode={activitySelectionMode}
              selectedIds={selectedActivityIds}
              onSelectionModeChange={(enabled) => {
                setActivitySelectionMode(enabled);
                setSelectedActivityIds([]);
              }}
              onToggleSelected={toggleSelectedActivity}
              onDeleteSelected={() => setDeleteRequest({ type: "activities", ids: selectedActivityIds })}
            />
          </div>
          <div className="min-w-0">
            <ReminderPanel
              reminders={visibleReminders}
              isLoading={reminders.isLoading}
              isError={reminders.isError}
              open={remindersOpen}
              onOpenChange={setRemindersOpen}
              onDelete={(reminder) => setDeleteRequest({ type: "reminder", reminder })}
              selectionMode={reminderSelectionMode}
              selectedKeys={selectedReminderKeys}
              getReminderKey={reminderKey}
              onSelectionModeChange={(enabled) => {
                setReminderSelectionMode(enabled);
                setSelectedReminderKeys([]);
              }}
              onToggleSelected={toggleSelectedReminder}
              onDeleteSelected={() => setDeleteRequest({ type: "reminders", reminders: selectedReminders })}
            />
          </div>
        </div>

        <StatsGrid stats={stats.data} isLoading={stats.isLoading} />

        {stats.isError ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            Dashboard statistics could not be loaded. Check that the backend is running and you are logged in.
          </p>
        ) : null}

        <InterviewList reminders={visibleReminders} isLoading={reminders.isLoading} />
      </div>

      <ConfirmDialog
        open={Boolean(deleteRequest)}
        onOpenChange={(open) => {
          if (!open && !deleteActivity.isPending) {
            setDeleteRequest(null);
          }
        }}
        title={
          deleteRequest?.type === "activity" || deleteRequest?.type === "activities"
            ? "Delete recent activity"
            : "Delete reminder"
        }
        description={
          deleteRequest?.type === "activity"
            ? "Delete this recent activity from the timeline? This action cannot be undone."
            : deleteRequest?.type === "activities"
              ? `Delete ${deleteRequest.ids.length} recent activities from the timeline? This action cannot be undone.`
              : deleteRequest?.type === "reminders"
                ? `Delete ${deleteRequest.reminders.length} reminders from the dashboard? The original applications, contacts, or interviews will not be deleted.`
                : "Delete this reminder from the dashboard? The original application, contact, or interview will not be deleted."
        }
        confirmLabel="Delete"
        isConfirming={deleteActivity.isPending}
        onConfirm={() => {
          if (deleteRequest?.type === "activity") {
            deleteActivity.mutate([deleteRequest.item.id]);
          }
          if (deleteRequest?.type === "activities") {
            deleteActivity.mutate(deleteRequest.ids);
          }
          if (deleteRequest?.type === "reminder") {
            dismissReminders([deleteRequest.reminder]);
          }
          if (deleteRequest?.type === "reminders") {
            dismissReminders(deleteRequest.reminders);
          }
        }}
      />
    </DashboardShell>
  );
}
