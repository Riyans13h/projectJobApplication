"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import { FilterPanel } from "@/components/applications/FilterPanel";
import { ApplicationTable } from "@/components/applications/ApplicationTable";
import { SearchBar } from "@/components/applications/SearchBar";
import { Header } from "@/components/layout/Header";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Loader } from "@/components/ui/loader";
import { applicationService } from "@/services/application.service";
import type { ApplicationStatus, Priority } from "@/types/application";

type DeleteRequest = { ids: number[]; label: string } | null;

export default function ApplicationsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<ApplicationStatus | "">("");
  const [priority, setPriority] = useState<Priority | "">("");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteRequest, setDeleteRequest] = useState<DeleteRequest>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const applications = useQuery({
    queryKey: ["applications", { page, company, status, priority }],
    queryFn: () =>
      applicationService.list({
        page,
        size: 10,
        company: company.trim() || undefined,
        status,
        priority,
      }),
  });

  const deleteApplication = useMutation({
    mutationFn: async (ids: number[]) => {
      for (const id of ids) {
        await applicationService.remove(id);
      }
    },
    onMutate: () => setDeleteError(null),
    onSuccess: async () => {
      setSelectedIds([]);
      setDeleteRequest(null);
      await queryClient.invalidateQueries({ queryKey: ["applications"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: () => setDeleteError("Could not delete the selected application. Please try again."),
  });

  const visibleApplications = useMemo(() => {
    const content = applications.data?.content ?? [];
    if (!role.trim()) {
      return content;
    }

    const normalized = role.trim().toLowerCase();
    return content.filter((application) => application.role.toLowerCase().includes(normalized));
  }, [applications.data?.content, role]);

  const clearFilters = () => {
    setCompany("");
    setRole("");
    setStatus("");
    setPriority("");
    setPage(0);
    setSelectedIds([]);
  };

  const toggleSelected = (id: number) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]));
  };

  const toggleAllVisible = () => {
    const visibleIds = visibleApplications.map((application) => application.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
    setSelectedIds((current) =>
      allVisibleSelected ? current.filter((id) => !visibleIds.includes(id)) : Array.from(new Set([...current, ...visibleIds])),
    );
  };

  const selectedVisibleCount = selectedIds.filter((id) => visibleApplications.some((application) => application.id === id)).length;

  return (
    <DashboardShell>
      <div className="flex items-start justify-between gap-4">
        <Header title="Applications" description="Track roles, stages, and outcomes." />
        <Button asChild>
          <Link href="/applications/create">New</Link>
        </Button>
      </div>

      <div className="space-y-3">
        <SearchBar
          company={company}
          role={role}
          onCompanyChange={(value) => {
            setCompany(value);
            setPage(0);
          }}
          onRoleChange={(value) => {
            setRole(value);
            setPage(0);
          }}
        />
        <FilterPanel
          status={status}
          priority={priority}
          onStatusChange={(value) => {
            setStatus(value);
            setPage(0);
          }}
          onPriorityChange={(value) => {
            setPriority(value);
            setPage(0);
          }}
          onClear={clearFilters}
        />
      </div>

      {applications.isLoading ? (
        <div className="flex h-56 items-center justify-center rounded-lg border bg-card">
          <Loader />
        </div>
      ) : applications.isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Could not load applications. Check that the backend is running and you are logged in.
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
          <ApplicationTable
            applications={visibleApplications}
            deletingId={deleteApplication.variables?.[0]}
            selectedIds={selectionMode ? selectedIds : undefined}
            onToggleSelected={selectionMode ? toggleSelected : undefined}
            onToggleAll={selectionMode ? toggleAllVisible : undefined}
            onDelete={selectionMode ? (id) => setDeleteRequest({ ids: [id], label: "this application" }) : undefined}
          />
        </div>
      )}

      {selectionMode ? (
        <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="text-muted-foreground">
            {selectedIds.length > 0
              ? `${selectedVisibleCount} selected on this page, ${selectedIds.length} selected total.`
              : "Choose applications to delete."}
          </span>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setSelectedIds([])}>
              Clear
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={selectedIds.length === 0 || deleteApplication.isPending}
              onClick={() => setDeleteRequest({ ids: selectedIds, label: `${selectedIds.length} selected applications` })}
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
          Page {(applications.data?.number ?? page) + 1} of {Math.max(applications.data?.totalPages ?? 1, 1)}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" disabled={page === 0 || applications.isFetching} onClick={() => setPage((current) => Math.max(current - 1, 0))}>
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={Boolean(applications.data?.last) || applications.isFetching}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteRequest)}
        onOpenChange={(open) => {
          if (!open && !deleteApplication.isPending) {
            setDeleteRequest(null);
          }
        }}
        title="Confirm deletion"
        description={
          <>
            Delete {deleteRequest?.label}? This action cannot be undone. Please confirm before removing the selected application
            {deleteRequest && deleteRequest.ids.length > 1 ? "s" : ""}.
          </>
        }
        confirmLabel="Delete"
        isConfirming={deleteApplication.isPending}
        onConfirm={() => {
          if (deleteRequest) {
            deleteApplication.mutate(deleteRequest.ids);
          }
        }}
      />
    </DashboardShell>
  );
}
