"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import { FilterPanel } from "@/components/contacts/FilterPanel";
import { ContactTable } from "@/components/contacts/ContactTable";
import { SearchBar } from "@/components/contacts/SearchBar";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Loader } from "@/components/ui/loader";
import { contactService } from "@/services/contact.service";
import type { ContactStatus, ContactType, HelpScore } from "@/types/contact";

type DeleteRequest = { ids: number[]; label: string } | null;

export default function ContactsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [contactType, setContactType] = useState<ContactType | "">("");
  const [status, setStatus] = useState<ContactStatus | "">("");
  const [helpScore, setHelpScore] = useState<HelpScore | "">("");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteRequest, setDeleteRequest] = useState<DeleteRequest>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const contacts = useQuery({
    queryKey: ["contacts", { page, company, contactType, status, helpScore }],
    queryFn: () =>
      contactService.list({
        page,
        size: 10,
        company: company.trim() || undefined,
        contactType,
        status,
        helpScore,
      }),
  });

  const deleteContact = useMutation({
    mutationFn: async (ids: number[]) => {
      for (const id of ids) {
        await contactService.remove(id);
      }
    },
    onMutate: () => setDeleteError(null),
    onSuccess: async () => {
      setSelectedIds([]);
      setDeleteRequest(null);
      await queryClient.invalidateQueries({ queryKey: ["contacts"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: () => setDeleteError("Could not delete the selected contact. Please try again."),
  });

  const visibleContacts = useMemo(() => {
    const content = contacts.data?.content ?? [];
    if (!name.trim()) {
      return content;
    }

    const normalized = name.trim().toLowerCase();
    return content.filter((contact) => contact.name.toLowerCase().includes(normalized));
  }, [contacts.data?.content, name]);

  const clearFilters = () => {
    setName("");
    setCompany("");
    setContactType("");
    setStatus("");
    setHelpScore("");
    setPage(0);
    setSelectedIds([]);
  };

  const toggleSelected = (id: number) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]));
  };

  const toggleAllVisible = () => {
    const visibleIds = visibleContacts.map((contact) => contact.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
    setSelectedIds((current) =>
      allVisibleSelected ? current.filter((id) => !visibleIds.includes(id)) : Array.from(new Set([...current, ...visibleIds])),
    );
  };

  const selectedVisibleCount = selectedIds.filter((id) => visibleContacts.some((contact) => contact.id === id)).length;

  return (
    <DashboardShell>
      <div className="flex items-start justify-between gap-4">
        <Header title="Contacts" description="Manage recruiters, referrals, mentors, and follow-ups." />
        <Button asChild>
          <Link href="/contacts/create">New</Link>
        </Button>
      </div>

      <div className="space-y-3">
        <SearchBar
          name={name}
          company={company}
          onNameChange={(value) => {
            setName(value);
            setPage(0);
          }}
          onCompanyChange={(value) => {
            setCompany(value);
            setPage(0);
          }}
        />
        <FilterPanel
          contactType={contactType}
          status={status}
          helpScore={helpScore}
          onContactTypeChange={(value) => {
            setContactType(value);
            setPage(0);
          }}
          onStatusChange={(value) => {
            setStatus(value);
            setPage(0);
          }}
          onHelpScoreChange={(value) => {
            setHelpScore(value);
            setPage(0);
          }}
          onClear={clearFilters}
        />
      </div>

      {contacts.isLoading ? (
        <div className="flex h-56 items-center justify-center rounded-lg border bg-card">
          <Loader />
        </div>
      ) : contacts.isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Could not load contacts. Check that the backend is running and you are logged in.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button
              type="button"
              variant={selectionMode ? "secondary" : "outline"}
              onClick={() => {
                setSelectionMode((current) => !current);
                setSelectedIds([]);
              }}
            >
              {selectionMode ? "Done" : "Delete"}
            </Button>
          </div>
          <ContactTable
            contacts={visibleContacts}
            deletingId={deleteContact.variables?.[0]}
            selectedIds={selectionMode ? selectedIds : undefined}
            onToggleSelected={selectionMode ? toggleSelected : undefined}
            onToggleAll={selectionMode ? toggleAllVisible : undefined}
            onDelete={selectionMode ? (id) => setDeleteRequest({ ids: [id], label: "this contact" }) : undefined}
          />
        </div>
      )}

      {selectionMode ? (
        <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="text-muted-foreground">
            {selectedIds.length > 0
              ? `${selectedVisibleCount} selected on this page, ${selectedIds.length} selected total.`
              : "Choose contacts to delete."}
          </span>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setSelectedIds([])}>
              Clear
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={selectedIds.length === 0 || deleteContact.isPending}
              onClick={() => setDeleteRequest({ ids: selectedIds, label: `${selectedIds.length} selected contacts` })}
            >
              Delete selected
            </Button>
          </div>
        </div>
      ) : null}

      {deleteError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{deleteError}</div>
      ) : null}

      <div className="flex items-center justify-between rounded-lg border bg-card p-3 text-sm">
        <span className="text-muted-foreground">
          Page {(contacts.data?.number ?? page) + 1} of {Math.max(contacts.data?.totalPages ?? 1, 1)}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" disabled={page === 0 || contacts.isFetching} onClick={() => setPage((current) => Math.max(current - 1, 0))}>
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={Boolean(contacts.data?.last) || contacts.isFetching}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteRequest)}
        onOpenChange={(open) => {
          if (!open && !deleteContact.isPending) {
            setDeleteRequest(null);
          }
        }}
        title="Confirm deletion"
        description={
          <>
            Delete {deleteRequest?.label}? This action cannot be undone. Please confirm before removing the selected contact
            {deleteRequest && deleteRequest.ids.length > 1 ? "s" : ""}.
          </>
        }
        confirmLabel="Delete"
        isConfirming={deleteContact.isPending}
        onConfirm={() => {
          if (deleteRequest) {
            deleteContact.mutate(deleteRequest.ids);
          }
        }}
      />
    </DashboardShell>
  );
}
