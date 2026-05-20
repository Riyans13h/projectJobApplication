import type { TimelineEvent } from "@/types/dashboard";

export function Timeline({ events = [] }: { events?: TimelineEvent[] }) {
  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="border-l-2 border-primary pl-4">
          <p className="text-sm font-medium">{event.event}</p>
          <p className="text-xs text-muted-foreground">{event.notes ?? new Date(event.eventDate).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
