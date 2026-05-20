"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { applicationService } from "@/services/application.service";
import type { ApplicationPayload, ApplicationUploadFiles } from "@/types/application";

function firstFile(files?: FileList | null) {
  return files?.length ? files[0] : undefined;
}

export default function CreateApplicationPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const createApplication = useMutation({
    mutationFn: async ({ payload, files }: { payload: ApplicationPayload; files: ApplicationUploadFiles }) => {
      const application = await applicationService.create(payload);
      const jobId = payload.jobId || String(application.id);

      const resume = firstFile(files.resume);
      const jd = firstFile(files.jd);
      const coverLetter = firstFile(files.coverLetter);

      await Promise.all([
        resume ? applicationService.uploadResume(resume, payload.companyName, jobId) : Promise.resolve(null),
        jd ? applicationService.uploadJd(jd, payload.companyName, jobId) : Promise.resolve(null),
        coverLetter ? applicationService.uploadCoverLetter(coverLetter, payload.companyName, jobId) : Promise.resolve(null),
      ]);

      return application;
    },
    onSuccess: async (application) => {
      await queryClient.invalidateQueries({ queryKey: ["applications"] });
      router.push(`/applications/${application.id}`);
    },
    onError: () => setError("Could not save the application. Check the backend connection and file upload settings."),
  });

  return (
    <DashboardShell>
      <div className="flex items-start justify-between gap-4">
        <Header title="New application" description="Create a tracked application and attach PDFs." />
        <Button asChild variant="outline">
          <Link href="/applications">Back</Link>
        </Button>
      </div>
      <Card className="max-w-5xl">
        <CardContent className="pt-5">
          <ApplicationForm
            error={error}
            isSubmitting={createApplication.isPending}
            submitLabel="Create application"
            onSubmit={(payload, files) => {
              setError(null);
              createApplication.mutate({ payload, files });
            }}
          />
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
