"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Mail, Phone, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ContactTypeBadge } from "@/components/contacts/ContactTypeBadge";
import { FollowupBadge } from "@/components/contacts/FollowupBadge";
import { HelpScoreBadge } from "@/components/contacts/HelpScoreBadge";
import { ContactForm } from "@/components/forms/ContactForm";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Loader } from "@/components/ui/loader";
import { contactService } from "@/services/contact.service";
import type { ContactPayload } from "@/types/contact";

export default function ContactDetailPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const contact = useQuery({
    queryKey: ["contacts", id],
    queryFn: () => contactService.getById(id),
    enabled: Number.isFinite(id),
  });

  const updateContact = useMutation({
    mutationFn: (payload: ContactPayload) => contactService.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["contacts"] });
      await queryClient.invalidateQueries({ queryKey: ["contacts", id] });
      setEditMode(false);
    },
    onError: () => setFormError("Could not update the contact. Check the backend connection and required fields."),
  });

  const deleteContact = useMutation({
    mutationFn: () => contactService.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["contacts"] });
      router.push("/contacts");
    },
  });

  return (
    <DashboardShell>
      <div className="flex items-start justify-between gap-4">
        <Header title="Contact detail" description="Profile, follow-up plan, notes, and status summary." />
        <Button asChild variant="outline">
          <Link href="/contacts">Back</Link>
        </Button>
      </div>

      {contact.isLoading ? (
        <div className="flex h-56 items-center justify-center rounded-lg border bg-card">
          <Loader />
        </div>
      ) : contact.isError || !contact.data ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Contact not found or unavailable.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle>{contact.data.name}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {[contact.data.role, contact.data.company].filter(Boolean).join(" at ") || "Contact profile"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <ContactTypeBadge contactType={contact.data.contactType} />
                    <FollowupBadge status={contact.data.status} />
                    <HelpScoreBadge helpScore={contact.data.helpScore} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Info label="Company" value={contact.data.company} />
                  <Info label="Role" value={contact.data.role} />
                  <Info label="Level" value={contact.data.level} />
                  <Info label="Source" value={contact.data.source} />
                  <Info label="Last contact" value={contact.data.lastContactDate} />
                  <Info label="Next follow-up" value={contact.data.nextFollowupDate} />
                  <Info label="Created" value={contact.data.createdAt?.slice(0, 10)} />
                  <Info label="Updated" value={contact.data.updatedAt?.slice(0, 10)} />
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {contact.data.email ? (
                    <Button asChild variant="outline">
                      <a href={`mailto:${contact.data.email}`}>
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                      </a>
                    </Button>
                  ) : null}
                  {contact.data.phone ? (
                    <Button asChild variant="outline">
                      <a href={`tel:${contact.data.phone}`}>
                        <Phone className="mr-2 h-4 w-4" />
                        Call
                      </a>
                    </Button>
                  ) : null}
                  {contact.data.linkedinUrl ? (
                    <Button asChild variant="outline">
                      <a href={contact.data.linkedinUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        LinkedIn
                      </a>
                    </Button>
                  ) : null}
                </div>

                {contact.data.notes ? (
                  <div className="mt-5 rounded-lg bg-muted p-4 text-sm">
                    <div className="font-medium">Notes</div>
                    <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{contact.data.notes}</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>Edit contact</CardTitle>
                  <Button variant="outline" onClick={() => setEditMode((current) => !current)}>
                    {editMode ? "Close" : "Edit"}
                  </Button>
                </div>
              </CardHeader>
              {editMode ? (
                <CardContent>
                  <ContactForm
                    initialValue={contact.data}
                    error={formError}
                    isSubmitting={updateContact.isPending}
                    submitLabel="Update contact"
                    onSubmit={(payload) => {
                      setFormError(null);
                      updateContact.mutate(payload);
                    }}
                  />
                </CardContent>
              ) : null}
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Follow-up</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Info label="Status" value={contact.data.status.replaceAll("_", " ")} />
                <Info label="Last contact date" value={contact.data.lastContactDate} />
                <Info label="Next follow-up date" value={contact.data.nextFollowupDate} />
                {contact.data.nextFollowupDate ? (
                  <p className="rounded-lg border bg-muted p-3 text-muted-foreground">
                    Follow up on {contact.data.nextFollowupDate} if there is no response.
                  </p>
                ) : (
                  <p className="rounded-lg border bg-muted p-3 text-muted-foreground">No follow-up date set.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status history</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="border-l-2 border-primary pl-3">
                  <div className="text-sm font-medium">{contact.data.status.replaceAll("_", " ")}</div>
                  <div className="text-xs text-muted-foreground">Current status · updated {contact.data.updatedAt?.slice(0, 10)}</div>
                </div>
                <div className="border-l-2 border-border pl-3">
                  <div className="text-sm font-medium">Contact created</div>
                  <div className="text-xs text-muted-foreground">{contact.data.createdAt?.slice(0, 10)}</div>
                </div>
              </CardContent>
            </Card>

            <Button
              variant="destructive"
              className="w-full"
              disabled={deleteContact.isPending}
              onClick={() => setConfirmDeleteOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete contact
            </Button>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Confirm deletion"
        description="Delete this contact? This action cannot be undone."
        confirmLabel="Delete"
        isConfirming={deleteContact.isPending}
        onConfirm={() => deleteContact.mutate()}
      />
    </DashboardShell>
  );
}

function Info({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm capitalize">{value || "Not set"}</div>
    </div>
  );
}
