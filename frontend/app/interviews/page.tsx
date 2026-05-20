"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InterviewForm, type InterviewFormSubmit } from "@/components/forms/InterviewForm";
import { FilterPanel } from "@/components/interviews/FilterPanel";
import { InterviewCard } from "@/components/interviews/InterviewCard";
import { InterviewTable } from "@/components/interviews/InterviewTable";
import { SearchBar } from "@/components/interviews/SearchBar";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Loader } from "@/components/ui/loader";
import { applicationService } from "@/services/application.service";
import { interviewService } from "@/services/interview.service";
import type { Application } from "@/types/application";
import type { InterviewFilters, InterviewWithApplication } from "@/types/interview";

const pageSize = 8;
type DeleteRequest = { ids: number[]; label: string } | null;

async function fetchInterviews() {
  const applicationsPage = await applicationService.list({ page: 0, size: 100 });
  const applications = applicationsPage.content;

  const interviewPages = await Promise.all(
    applications.map((application) => interviewService.listForApplication(application.id, 0, 100)),
  );

  const applicationById = new Map<number, Application>(applications.map((application) => [application.id, application]));
  const interviews = interviewPages
    .flatMap((page) => page.content)
    .map<InterviewWithApplication>((interview) => {
      const application = applicationById.get(interview.applicationId);
      return {
        ...interview,
        application,
        companyName: application?.companyName,
        role: application?.role,
      };
    })
    .sort((left, right) => new Date(right.interviewDate).getTime() - new Date(left.interviewDate).getTime());

  return { applications, interviews };
}

export default function InterviewsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | undefined>();
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteRequest, setDeleteRequest] = useState<DeleteRequest>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [filters, setFilters] = useState<InterviewFilters>({ search: "", result: "", mode: "" });

  const interviewsQuery = useQuery({ queryKey: ["interviews"], queryFn: fetchInterviews });

  const createInterview = useMutation({
    mutationFn: async ({ applicationId, payload }: InterviewFormSubmit) => {
      if (!applicationId) {
        throw new Error("Application is required");
      }
      return interviewService.create(applicationId, payload);
    },
    onSuccess: async () => {
      setFormError(null);
      await queryClient.invalidateQueries({ queryKey: ["interviews"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: () => setFormError("Could not create the interview. Check required fields and backend connection."),
  });

  const deleteInterview = useMutation({
    mutationFn: async (ids: number[]) => {
      for (const id of ids) {
        await interviewService.remove(id);
      }
    },
    onMutate: (ids) => {
      setDeleteError(null);
      setDeletingId(ids[0]);
    },
    onSuccess: async () => {
      setSelectedIds([]);
      setDeleteRequest(null);
      await queryClient.invalidateQueries({ queryKey: ["interviews"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: () => setDeleteError("Could not delete the selected interview. Please try again."),
    onSettled: () => setDeletingId(undefined),
  });

  const filteredInterviews = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return (interviewsQuery.data?.interviews ?? []).filter((interview) => {
      const matchesSearch =
        !search ||
        interview.roundName.toLowerCase().includes(search) ||
        interview.companyName?.toLowerCase().includes(search) ||
        interview.role?.toLowerCase().includes(search);
      const matchesResult = !filters.result || interview.result === filters.result;
      const matchesMode = !filters.mode || interview.mode === filters.mode;
      return matchesSearch && matchesResult && matchesMode;
    });
  }, [filters, interviewsQuery.data?.interviews]);

  const totalPages = Math.max(1, Math.ceil(filteredInterviews.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const pagedInterviews = filteredInterviews.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  function updateFilters(next: Partial<InterviewFilters>) {
    setPage(0);
    setSelectedIds([]);
    setFilters((current) => ({ ...current, ...next }));
  }

  const toggleSelected = (id: number) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]));
  };

  const toggleAllVisible = () => {
    const visibleIds = pagedInterviews.map((interview) => interview.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
    setSelectedIds((current) =>
      allVisibleSelected ? current.filter((id) => !visibleIds.includes(id)) : Array.from(new Set([...current, ...visibleIds])),
    );
  };

  const selectedVisibleCount = selectedIds.filter((id) => pagedInterviews.some((interview) => interview.id === id)).length;

  return (
    <DashboardShell>
      <Header title="Interviews" description="Track interview rounds across your active applications." />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Add interview round</CardTitle>
          </CardHeader>
          <CardContent>
            <InterviewForm
              applications={interviewsQuery.data?.applications ?? []}
              showApplicationSelect
              onSubmit={(values) => createInterview.mutate(values)}
              isSubmitting={createInterview.isPending}
              error={formError}
            />
          </CardContent>
        </Card>

        <div className="grid gap-3 lg:grid-cols-[1fr_420px]">
          <SearchBar value={filters.search} onChange={(value) => updateFilters({ search: value })} />
          <FilterPanel
            result={filters.result}
            mode={filters.mode}
            onResultChange={(value) => updateFilters({ result: value })}
            onModeChange={(value) => updateFilters({ mode: value })}
          />
        </div>

        {interviewsQuery.isLoading ? (
          <div className="flex min-h-40 items-center justify-center rounded-lg border bg-card">
            <Loader />
          </div>
        ) : null}

        {interviewsQuery.isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Could not load interviews. Make sure the backend is running and you are logged in.
          </div>
        ) : null}

        {!interviewsQuery.isLoading && !interviewsQuery.isError ? (
          <>
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
            <div className="hidden lg:block">
              <InterviewTable
                interviews={pagedInterviews}
                onDelete={selectionMode ? (id) => setDeleteRequest({ ids: [id], label: "this interview" }) : undefined}
                deletingId={deletingId}
                selectedIds={selectionMode ? selectedIds : undefined}
                onToggleSelected={selectionMode ? toggleSelected : undefined}
                onToggleAll={selectionMode ? toggleAllVisible : undefined}
              />
            </div>
            <div className="grid gap-3 lg:hidden">
              {pagedInterviews.length === 0 ? (
                <p className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">No interviews found.</p>
              ) : (
                pagedInterviews.map((interview) => (
                  <InterviewCard
                    key={interview.id}
                    interview={interview}
                    onDelete={selectionMode ? (id) => setDeleteRequest({ ids: [id], label: "this interview" }) : undefined}
                    deletingId={deletingId}
                  />
                ))
              )}
            </div>

            {selectionMode ? (
              <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <span className="text-muted-foreground">
                  {selectedIds.length > 0
                    ? `${selectedVisibleCount} selected on this page, ${selectedIds.length} selected total.`
                    : "Choose interviews to delete."}
                </span>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setSelectedIds([])}>
                    Clear
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={selectedIds.length === 0 || deleteInterview.isPending}
                    onClick={() => setDeleteRequest({ ids: selectedIds, label: `${selectedIds.length} selected interviews` })}
                  >
                    Delete selected
                  </Button>
                </div>
              </div>
            ) : null}

            {deleteError ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{deleteError}</div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {pagedInterviews.length} of {filteredInterviews.length} interviews
              </p>
              <div className="flex gap-2">
                <Button variant="outline" disabled={currentPage === 0} onClick={() => setPage((value) => Math.max(0, value - 1))}>
                  Previous
                </Button>
                <Button variant="outline" disabled={currentPage >= totalPages - 1} onClick={() => setPage((value) => Math.min(totalPages - 1, value + 1))}>
                  Next
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <ConfirmDialog
        open={Boolean(deleteRequest)}
        onOpenChange={(open) => {
          if (!open && !deleteInterview.isPending) {
            setDeleteRequest(null);
          }
        }}
        title="Confirm deletion"
        description={
          <>
            Delete {deleteRequest?.label}? This action cannot be undone. Please confirm before removing the selected interview
            {deleteRequest && deleteRequest.ids.length > 1 ? "s" : ""}.
          </>
        }
        confirmLabel="Delete"
        isConfirming={deleteInterview.isPending}
        onConfirm={() => {
          if (deleteRequest) {
            deleteInterview.mutate(deleteRequest.ids);
          }
        }}
      />
    </DashboardShell>
  );
}
