"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { ActivityCard } from "@/components/dashboard/ActivityCard";
import { Button } from "@/components/ui/button";
import type { TimelineEvent } from "@/types/dashboard";

function ActivitySkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="rounded-lg border bg-card p-4">
          <div className="flex gap-3">
            <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ActivityFeed({
  items = [],
  isLoading = false,
  isError = false,
  open = false,
  onOpenChange,
  onDelete,
  selectionMode = false,
  selectedIds = [],
  onSelectionModeChange,
  onToggleSelected,
  onDeleteSelected,
}: {
  items?: TimelineEvent[];
  isLoading?: boolean;
  isError?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onDelete?: (item: TimelineEvent) => void;
  selectionMode?: boolean;
  selectedIds?: number[];
  onSelectionModeChange?: (enabled: boolean) => void;
  onToggleSelected?: (item: TimelineEvent) => void;
  onDeleteSelected?: () => void;
}) {
  const Icon = open ? ChevronDown : ChevronRight;
  const selectedSet = new Set(selectedIds);

  return (
    <section className="min-w-0 space-y-3">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2 text-left"
        onClick={() => onOpenChange?.(!open)}
      >
        <div>
          <h2 className="text-sm font-semibold">Recent activity</h2>
          <p className="text-xs text-muted-foreground">Click to open timeline entries.</p>
        </div>
        <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
      </button>

      {open ? (
        <>
          {isLoading ? <ActivitySkeleton /> : null}
          {isError ? <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">Could not load activity.</p> : null}
          {!isLoading && !isError && items.length === 0 ? (
            <p className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">No recent activity yet.</p>
          ) : null}
          {!isLoading && !isError && items.length > 0 ? (
            <div className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-xs">
              <span className="text-muted-foreground">
                {selectionMode ? `${selectedIds.length} selected` : "Delete one by one or select multiple."}
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
                    disabled={selectedIds.length === 0}
                    onClick={onDeleteSelected}
                  >
                    Delete selected
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
          {!isLoading && !isError && items.length > 0 ? (
            <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {items.map((item) => (
                <ActivityCard
                  key={item.id}
                  item={item}
                  onDelete={onDelete}
                  selected={selectedSet.has(item.id)}
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
