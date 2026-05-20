import Link from "next/link";
import { ExternalLink, Trash2 } from "lucide-react";
import { ContactTypeBadge } from "@/components/contacts/ContactTypeBadge";
import { FollowupBadge } from "@/components/contacts/FollowupBadge";
import { HelpScoreBadge } from "@/components/contacts/HelpScoreBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Contact } from "@/types/contact";

interface ContactTableProps {
  contacts?: Contact[];
  onDelete?: (id: number) => void;
  deletingId?: number;
  selectedIds?: number[];
  onToggleSelected?: (id: number) => void;
  onToggleAll?: () => void;
}

export function ContactTable({ contacts = [], onDelete, deletingId, selectedIds = [], onToggleSelected, onToggleAll }: ContactTableProps) {
  const selectedSet = new Set(selectedIds);
  const allSelected = contacts.length > 0 && contacts.every((contact) => selectedSet.has(contact.id));
  const hasSelection = Boolean(onToggleSelected);

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {hasSelection ? (
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  aria-label="Select all contacts"
                  checked={allSelected}
                  onChange={onToggleAll}
                  className="h-4 w-4 rounded border-border"
                />
              </TableHead>
            ) : null}
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Help</TableHead>
            <TableHead>Next follow-up</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={hasSelection ? 8 : 7} className="h-28 text-center text-muted-foreground">
                No contacts yet.
              </TableCell>
            </TableRow>
          ) : (
            contacts.map((contact) => (
              <TableRow key={contact.id}>
                {hasSelection ? (
                  <TableCell>
                    <input
                      type="checkbox"
                      aria-label={`Select ${contact.name}`}
                      checked={selectedSet.has(contact.id)}
                      onChange={() => onToggleSelected?.(contact.id)}
                      className="h-4 w-4 rounded border-border"
                    />
                  </TableCell>
                ) : null}
                <TableCell className="min-w-40">
                  <div className="font-medium">{contact.name}</div>
                  <div className="text-xs text-muted-foreground">{contact.role || contact.level || "Role not set"}</div>
                </TableCell>
                <TableCell className="min-w-36">{contact.company ?? "-"}</TableCell>
                <TableCell>
                  <ContactTypeBadge contactType={contact.contactType} />
                </TableCell>
                <TableCell>
                  <FollowupBadge status={contact.status} />
                </TableCell>
                <TableCell>
                  <HelpScoreBadge helpScore={contact.helpScore} />
                </TableCell>
                <TableCell className="whitespace-nowrap">{contact.nextFollowupDate ?? "Not set"}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="outline" size="icon" aria-label="Open contact">
                      <Link href={`/contacts/${contact.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                    {onDelete ? (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        aria-label="Delete contact"
                        disabled={deletingId === contact.id}
                        onClick={() => onDelete(contact.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
