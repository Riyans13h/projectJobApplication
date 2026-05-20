import Link from "next/link";
import { ContactTypeBadge } from "@/components/contacts/ContactTypeBadge";
import { FollowupBadge } from "@/components/contacts/FollowupBadge";
import { HelpScoreBadge } from "@/components/contacts/HelpScoreBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Contact } from "@/types/contact";

export function ContactCard({ contact }: { contact: Contact }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle>{contact.name}</CardTitle>
          <FollowupBadge status={contact.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <ContactTypeBadge contactType={contact.contactType} />
          <HelpScoreBadge helpScore={contact.helpScore} />
        </div>
        <p className="mt-3 text-sm font-medium">{contact.role ?? contact.level ?? "Role not set"}</p>
        <p className="mt-1 text-sm text-muted-foreground">{contact.company ?? "Company not set"}</p>
        <Link href={`/contacts/${contact.id}`} className="mt-4 inline-flex text-sm font-medium text-primary">
          View details
        </Link>
      </CardContent>
    </Card>
  );
}
