"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Eye, FileText, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PriorityBadge } from "@/components/applications/PriorityBadge";
import { StatusBadge } from "@/components/applications/StatusBadge";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Loader } from "@/components/ui/loader";
import { applicationService } from "@/services/application.service";
import type { ApplicationPayload, ApplicationUploadFiles, FileUploadResponse } from "@/types/application";

function firstFile(files?: FileList | null) {
  return files?.length ? files[0] : undefined;
}

export default function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const application = useQuery({
    queryKey: ["applications", id],
    queryFn: () => applicationService.getById(id),
    enabled: Number.isFinite(id),
  });

  const interviews = useQuery({
    queryKey: ["applications", id, "interviews"],
    queryFn: () => applicationService.interviews(id),
    enabled: Number.isFinite(id),
  });

  const timeline = useQuery({
    queryKey: ["applications", id, "timeline"],
    queryFn: () => applicationService.timeline(id),
    enabled: Number.isFinite(id),
  });

  const cooldown = useQuery({
    queryKey: ["applications", id, "cooldown", application.data?.companyName],
    queryFn: () => applicationService.cooldown(application.data!.companyName),
    enabled: Boolean(application.data?.companyName),
  });

  const applicationJobId = application.data?.jobId || (Number.isFinite(id) ? String(id) : "");

  const uploadedFiles = useQuery({
    queryKey: ["applications", id, "files", application.data?.companyName, applicationJobId],
    queryFn: () => applicationService.files(application.data!.companyName, applicationJobId),
    enabled: Boolean(application.data?.companyName && applicationJobId),
  });

  const updateApplication = useMutation({
    mutationFn: async ({ payload, files }: { payload: ApplicationPayload; files: ApplicationUploadFiles }) => {
      const updated = await applicationService.update(id, payload);
      const jobId = payload.jobId || String(updated.id);
      const resume = firstFile(files.resume);
      const jd = firstFile(files.jd);
      const coverLetter = firstFile(files.coverLetter);

      await Promise.all([
        resume ? applicationService.uploadResume(resume, payload.companyName, jobId) : Promise.resolve(null),
        jd ? applicationService.uploadJd(jd, payload.companyName, jobId) : Promise.resolve(null),
        coverLetter ? applicationService.uploadCoverLetter(coverLetter, payload.companyName, jobId) : Promise.resolve(null),
      ]);

      return updated;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["applications"] });
      await queryClient.invalidateQueries({ queryKey: ["applications", id] });
      await queryClient.invalidateQueries({ queryKey: ["applications", id, "files"] });
      setEditMode(false);
    },
    onError: () => setFormError("Could not update the application. Check the backend connection and file upload settings."),
  });

  const deleteApplication = useMutation({
    mutationFn: () => applicationService.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["applications"] });
      router.push("/applications");
    },
  });

  return (
    <DashboardShell>
      <div className="flex items-start justify-between gap-4">
        <Header title="Application detail" description="Company, files, interviews, timeline, and cooldown." />
        <Button asChild variant="outline">
          <Link href="/applications">Back</Link>
        </Button>
      </div>

      {application.isLoading ? (
        <div className="flex h-56 items-center justify-center rounded-lg border bg-card">
          <Loader />
        </div>
      ) : application.isError || !application.data ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Application not found or unavailable.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle>{application.data.companyName}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">{application.data.role}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={application.data.status} />
                    <PriorityBadge priority={application.data.priority} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Info label="Job ID" value={application.data.jobId} />
                  <Info label="Location" value={application.data.location} />
                  <Info label="Work mode" value={application.data.workMode} />
                  <Info label="Employment" value={application.data.employmentType} />
                  <Info label="Applied on" value={application.data.applicationDate} />
                  <Info label="Applied through" value={application.data.appliedThrough} />
                  <Info label="Email used" value={application.data.emailUsed} />
                  <Info label="Phone used" value={application.data.phoneUsed} />
                  <Info label="Cooldown period" value={`${application.data.cooldownPeriod ?? 0} days`} />
                  <Info label="Updated" value={application.data.updatedAt?.slice(0, 10)} />
                </div>
                {application.data.notes ? (
                  <div className="mt-5 rounded-lg bg-muted p-4 text-sm">
                    <div className="font-medium">Notes</div>
                    <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{application.data.notes}</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>Edit application</CardTitle>
                  <Button variant="outline" onClick={() => setEditMode((current) => !current)}>
                    {editMode ? "Close" : "Edit"}
                  </Button>
                </div>
              </CardHeader>
              {editMode ? (
                <CardContent>
                  <ApplicationForm
                    initialValue={application.data}
                    error={formError}
                    isSubmitting={updateApplication.isPending}
                    submitLabel="Update application"
                    onSubmit={(payload, files) => {
                      setFormError(null);
                      updateApplication.mutate({ payload, files });
                    }}
                  />
                </CardContent>
              ) : null}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {interviews.isLoading ? <Loader /> : null}
                {(interviews.data?.content ?? []).length === 0 && !interviews.isLoading ? (
                  <p className="text-sm text-muted-foreground">No interview rounds recorded yet.</p>
                ) : null}
                {(interviews.data?.content ?? []).map((interview) => (
                  <div key={interview.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium">{interview.roundName}</div>
                      <span className="text-xs text-muted-foreground">{interview.result}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {interview.interviewDate} · {interview.mode}
                    </p>
                    {interview.notes ? <p className="mt-2 text-sm">{interview.notes}</p> : null}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Uploaded files</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {uploadedFiles.isLoading ? <Loader /> : null}
                {uploadedFiles.isError ? (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    Could not load uploaded files.
                  </div>
                ) : null}
                {!uploadedFiles.isLoading && !uploadedFiles.isError ? (
                  <FileList files={uploadedFiles.data ?? []} />
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cooldown</CardTitle>
              </CardHeader>
              <CardContent>
                {cooldown.isLoading ? <Loader /> : null}
                {cooldown.data ? (
                  <div className="space-y-2 text-sm">
                    <Info label="Last applied" value={cooldown.data.lastAppliedDate} />
                    <Info label="Eligible reapply" value={cooldown.data.eligibleReapplyDate} />
                    <Info label="Days remaining" value={String(cooldown.data.daysRemaining)} />
                    <p className={cooldown.data.cooldownActive ? "text-amber-700 dark:text-amber-300" : "text-emerald-700 dark:text-emerald-300"}>
                      {cooldown.data.message}
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {timeline.isLoading ? <Loader /> : null}
                {(timeline.data?.content ?? []).length === 0 && !timeline.isLoading ? (
                  <p className="text-sm text-muted-foreground">No timeline entries yet.</p>
                ) : null}
                {(timeline.data?.content ?? []).map((entry) => (
                  <div key={entry.id} className="border-l-2 border-primary pl-3">
                    <div className="text-sm font-medium">{entry.event}</div>
                    <div className="text-xs text-muted-foreground">{entry.eventDate}</div>
                    {entry.notes ? <p className="mt-1 text-sm text-muted-foreground">{entry.notes}</p> : null}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button
              variant="destructive"
              className="w-full"
              disabled={deleteApplication.isPending}
              onClick={() => setConfirmDeleteOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete application
            </Button>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Confirm deletion"
        description="Delete this application? This action cannot be undone."
        confirmLabel="Delete"
        isConfirming={deleteApplication.isPending}
        onConfirm={() => deleteApplication.mutate()}
      />
    </DashboardShell>
  );
}

function Info({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm">{value || "Not set"}</div>
    </div>
  );
}

function FileList({ files }: { files: FileUploadResponse[] }) {
  const latestByType = new Map<string, FileUploadResponse>();
  for (const file of files) {
    if (!latestByType.has(file.fileType)) {
      latestByType.set(file.fileType, file);
    }
  }

  const rows = [
    { type: "RESUME", label: "Resume" },
    { type: "JD", label: "Job description" },
    { type: "COVER_LETTER", label: "Cover letter" },
  ].map((row) => ({ ...row, file: latestByType.get(row.type) }));

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.type} className="rounded-lg border p-3">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <FileText className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">{row.label}</div>
              <div className="mt-1 truncate text-xs text-muted-foreground">{row.file?.storedFileName ?? "No file uploaded"}</div>
              {row.file ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm">
                    <a href={row.file.fileUrl} target="_blank" rel="noreferrer">
                      <Eye className="mr-2 h-3.5 w-3.5" />
                      View
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <a href={row.file.downloadUrl || row.file.fileUrl} target="_blank" rel="noreferrer">
                      <Download className="mr-2 h-3.5 w-3.5" />
                      Download
                    </a>
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
