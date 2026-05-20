"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Trash2 } from "lucide-react";
import { InterviewForm, type InterviewFormSubmit } from "@/components/forms/InterviewForm";
import { InterviewModeBadge } from "@/components/interviews/InterviewModeBadge";
import { InterviewResultBadge } from "@/components/interviews/InterviewResultBadge";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Loader } from "@/components/ui/loader";
import { applicationService } from "@/services/application.service";
import { interviewService } from "@/services/interview.service";
import { formatDateTime } from "@/utils/date";

export default function InterviewDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = Number(params.id);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const interview = useQuery({
    queryKey: ["interviews", id],
    queryFn: () => interviewService.getById(id),
    enabled: Number.isFinite(id),
  });

  const application = useQuery({
    queryKey: ["applications", interview.data?.applicationId],
    queryFn: () => applicationService.getById(interview.data!.applicationId),
    enabled: Boolean(interview.data?.applicationId),
  });

  const updateInterview = useMutation({
    mutationFn: ({ payload }: InterviewFormSubmit) => interviewService.update(id, payload),
    onSuccess: async () => {
      setFormError(null);
      await queryClient.invalidateQueries({ queryKey: ["interviews"] });
      await queryClient.invalidateQueries({ queryKey: ["interviews", id] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: () => setFormError("Could not update the interview. Check required fields and backend connection."),
  });

  const deleteInterview = useMutation({
    mutationFn: () => interviewService.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["interviews"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      router.push("/interviews");
    },
  });

  return (
    <DashboardShell>
      <div className="mb-4">
        <Button asChild variant="ghost">
          <Link href="/interviews">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to interviews
          </Link>
        </Button>
      </div>

      <Header title="Interview details" description="Review and update the round, notes, mode, and result." />

      {interview.isLoading ? (
        <div className="flex min-h-40 items-center justify-center rounded-lg border bg-card">
          <Loader />
        </div>
      ) : null}

      {interview.isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">Could not load this interview.</div>
      ) : null}

      {interview.data ? (
        <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{interview.data.roundName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <InterviewModeBadge mode={interview.data.mode} />
                  <InterviewResultBadge result={interview.data.result} />
                </div>
                <Info label="Interview date" value={formatDateTime(interview.data.interviewDate)} />
                <Info label="Application" value={application.data ? `${application.data.companyName} - ${application.data.role}` : `#${interview.data.applicationId}`} />
                <Info label="Created" value={formatDateTime(interview.data.createdAt)} />
                {application.data ? (
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/applications/${application.data.id}`}>Open related application</Link>
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="destructive"
                  className="w-full"
                  disabled={deleteInterview.isPending}
                  onClick={() => setConfirmDeleteOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deleteInterview.isPending ? "Deleting..." : "Delete interview"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {interview.data.notes ? (
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">{interview.data.notes}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">No notes added.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Update interview</CardTitle>
            </CardHeader>
            <CardContent>
              <InterviewForm
                initialValue={interview.data}
                onSubmit={(values) => updateInterview.mutate(values)}
                isSubmitting={updateInterview.isPending}
                submitLabel="Update interview"
                error={formError}
              />
            </CardContent>
          </Card>
        </div>
      ) : null}
      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Confirm deletion"
        description="Delete this interview? This action cannot be undone."
        confirmLabel="Delete"
        isConfirming={deleteInterview.isPending}
        onConfirm={() => deleteInterview.mutate()}
      />
    </DashboardShell>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value || "Not set"}</p>
    </div>
  );
}
