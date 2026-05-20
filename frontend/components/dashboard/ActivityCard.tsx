"use client";

import { CircleDot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { TimelineEvent } from "@/types/dashboard";
import { formatDateTime } from "@/utils/date";

export function ActivityCard({
  item,
  onDelete,
  selected = false,
  onToggleSelected,
}: {
  item: TimelineEvent;
  onDelete?: (item: TimelineEvent) => void;
  selected?: boolean;
  onToggleSelected?: (item: TimelineEvent) => void;
}) {
  return (
    <Card>
      <CardContent className="p-2.5">
        <div className="flex items-start gap-2">
          {onToggleSelected ? (
            <input
              type="checkbox"
              aria-label={`Select activity ${item.event}`}
              checked={selected}
              onChange={() => onToggleSelected(item)}
              className="mt-1 h-4 w-4 shrink-0 rounded border-border"
            />
          ) : null}
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <CircleDot className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="break-words text-sm font-medium leading-5">{item.event}</p>
                {item.notes ? <p className="mt-0.5 line-clamp-1 break-words text-xs text-muted-foreground">{item.notes}</p> : null}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge>{formatDateTime(item.eventDate)}</Badge>
                {onDelete ? (
                  <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => onDelete(item)}>
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
