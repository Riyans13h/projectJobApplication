import Link from "next/link";
import { PriorityBadge } from "@/components/applications/PriorityBadge";
import { StatusBadge } from "@/components/applications/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Application } from "@/types/application";

export function ApplicationCard({ application }: { application: Application }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle>{application.companyName}</CardTitle>
          <StatusBadge status={application.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">{application.role}</p>
            <p className="mt-1 text-sm text-muted-foreground">{application.location ?? "Location not set"}</p>
          </div>
          <PriorityBadge priority={application.priority} />
        </div>
        <Link href={`/applications/${application.id}`} className="mt-4 inline-flex text-sm font-medium text-primary">
          View details
        </Link>
      </CardContent>
    </Card>
  );
}
