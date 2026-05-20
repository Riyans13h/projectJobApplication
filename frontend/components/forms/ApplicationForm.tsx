"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Application, ApplicationPayload, ApplicationUploadFiles } from "@/types/application";
import { cn } from "@/utils/cn";

const maxPdfSize = 10 * 1024 * 1024;

const pdfFile = z
  .any()
  .optional()
  .refine((files) => !files?.[0] || files[0].type === "application/pdf", "Only PDF files are allowed")
  .refine((files) => !files?.[0] || files[0].size <= maxPdfSize, "PDF must be 10MB or smaller");

const schema = z.object({
  companyName: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  jobId: z.string().optional(),
  location: z.string().optional(),
  workMode: z.enum(["REMOTE", "ONSITE", "HYBRID"]).optional(),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "FREELANCE"]).optional(),
  status: z.enum([
    "APPLIED",
    "OA_RECEIVED",
    "OA_SUBMITTED",
    "INTERVIEW_SCHEDULED",
    "INTERVIEW_IN_PROGRESS",
    "INTERVIEW_COMPLETED",
    "OFFER_RECEIVED",
    "REJECTED",
    "WITHDRAWN",
    "HOLD",
  ]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  applicationDate: z.string().min(1, "Application date is required"),
  appliedThrough: z.string().optional(),
  emailUsed: z.string().email("Use a valid email").or(z.literal("")).optional(),
  phoneUsed: z.string().optional(),
  cooldownPeriod: z.coerce.number().min(0).max(365).optional(),
  notes: z.string().optional(),
  resume: pdfFile,
  jd: pdfFile,
  coverLetter: pdfFile,
});

export type ApplicationFormValues = z.infer<typeof schema>;

interface ApplicationFormProps {
  initialValue?: Application;
  onSubmit?: (payload: ApplicationPayload, files: ApplicationUploadFiles) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  error?: string | null;
}

const inputLike =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export function ApplicationForm({ initialValue, onSubmit, submitLabel = "Save application", isSubmitting, error }: ApplicationFormProps) {
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: initialValue?.companyName ?? "",
      role: initialValue?.role ?? "",
      jobId: initialValue?.jobId ?? "",
      location: initialValue?.location ?? "",
      workMode: initialValue?.workMode ?? "HYBRID",
      employmentType: initialValue?.employmentType ?? "FULL_TIME",
      status: initialValue?.status ?? "APPLIED",
      priority: initialValue?.priority ?? "MEDIUM",
      applicationDate: initialValue?.applicationDate ?? new Date().toISOString().slice(0, 10),
      appliedThrough: initialValue?.appliedThrough ?? "",
      emailUsed: initialValue?.emailUsed ?? "",
      phoneUsed: initialValue?.phoneUsed ?? "",
      cooldownPeriod: initialValue?.cooldownPeriod ?? 90,
      notes: initialValue?.notes ?? "",
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    const payload: ApplicationPayload = {
      companyName: values.companyName.trim(),
      role: values.role.trim(),
      jobId: values.jobId?.trim() || undefined,
      location: values.location?.trim() || undefined,
      workMode: values.workMode,
      employmentType: values.employmentType,
      status: values.status,
      priority: values.priority,
      applicationDate: values.applicationDate,
      appliedThrough: values.appliedThrough?.trim() || undefined,
      emailUsed: values.emailUsed?.trim() || undefined,
      phoneUsed: values.phoneUsed?.trim() || undefined,
      cooldownPeriod: Number.isFinite(values.cooldownPeriod) ? values.cooldownPeriod : undefined,
      notes: values.notes?.trim() || undefined,
    };

    return onSubmit?.(payload, {
      resume: values.resume,
      jd: values.jd,
      coverLetter: values.coverLetter,
    });
  });

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error ? <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Company" htmlFor="companyName" error={form.formState.errors.companyName?.message}>
          <Input id="companyName" {...form.register("companyName")} />
        </Field>
        <Field label="Role" htmlFor="role" error={form.formState.errors.role?.message}>
          <Input id="role" {...form.register("role")} />
        </Field>
        <Field label="Job ID" htmlFor="jobId" error={form.formState.errors.jobId?.message}>
          <Input id="jobId" {...form.register("jobId")} />
        </Field>
        <Field label="Location" htmlFor="location" error={form.formState.errors.location?.message}>
          <Input id="location" {...form.register("location")} />
        </Field>
        <Field label="Work mode" htmlFor="workMode" error={form.formState.errors.workMode?.message}>
          <select id="workMode" className={inputLike} {...form.register("workMode")}>
            <option value="REMOTE">Remote</option>
            <option value="ONSITE">Onsite</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </Field>
        <Field label="Employment type" htmlFor="employmentType" error={form.formState.errors.employmentType?.message}>
          <select id="employmentType" className={inputLike} {...form.register("employmentType")}>
            <option value="FULL_TIME">Full time</option>
            <option value="PART_TIME">Part time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="FREELANCE">Freelance</option>
          </select>
        </Field>
        <Field label="Status" htmlFor="status" error={form.formState.errors.status?.message}>
          <select id="status" className={inputLike} {...form.register("status")}>
            <option value="APPLIED">Applied</option>
            <option value="OA_RECEIVED">OA received</option>
            <option value="OA_SUBMITTED">OA submitted</option>
            <option value="INTERVIEW_SCHEDULED">Interview scheduled</option>
            <option value="INTERVIEW_IN_PROGRESS">Interviewing</option>
            <option value="INTERVIEW_COMPLETED">Interview complete</option>
            <option value="OFFER_RECEIVED">Offer received</option>
            <option value="REJECTED">Rejected</option>
            <option value="WITHDRAWN">Withdrawn</option>
            <option value="HOLD">Hold</option>
          </select>
        </Field>
        <Field label="Priority" htmlFor="priority" error={form.formState.errors.priority?.message}>
          <select id="priority" className={inputLike} {...form.register("priority")}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </Field>
        <Field label="Application date" htmlFor="applicationDate" error={form.formState.errors.applicationDate?.message}>
          <Input id="applicationDate" type="date" {...form.register("applicationDate")} />
        </Field>
        <Field label="Applied through" htmlFor="appliedThrough" error={form.formState.errors.appliedThrough?.message}>
          <Input id="appliedThrough" placeholder="LinkedIn, referral, careers page" {...form.register("appliedThrough")} />
        </Field>
        <Field label="Email used" htmlFor="emailUsed" error={form.formState.errors.emailUsed?.message}>
          <Input id="emailUsed" type="email" {...form.register("emailUsed")} />
        </Field>
        <Field label="Phone used" htmlFor="phoneUsed" error={form.formState.errors.phoneUsed?.message}>
          <Input id="phoneUsed" {...form.register("phoneUsed")} />
        </Field>
        <Field label="Cooldown period" htmlFor="cooldownPeriod" error={form.formState.errors.cooldownPeriod?.message}>
          <Input id="cooldownPeriod" type="number" min={0} max={365} {...form.register("cooldownPeriod")} />
        </Field>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          rows={4}
          className={cn(inputLike, "h-auto py-2")}
          {...form.register("notes")}
        />
        <p className="text-xs text-destructive">{form.formState.errors.notes?.message}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Resume PDF" htmlFor="resume" error={form.formState.errors.resume?.message?.toString()}>
          <Input id="resume" type="file" accept="application/pdf,.pdf" {...form.register("resume")} />
        </Field>
        <Field label="JD PDF" htmlFor="jd" error={form.formState.errors.jd?.message?.toString()}>
          <Input id="jd" type="file" accept="application/pdf,.pdf" {...form.register("jd")} />
        </Field>
        <Field label="Cover letter PDF" htmlFor="coverLetter" error={form.formState.errors.coverLetter?.message?.toString()}>
          <Input id="coverLetter" type="file" accept="application/pdf,.pdf" {...form.register("coverLetter")} />
        </Field>
      </div>

      <Button type="submit" disabled={isSubmitting || form.formState.isSubmitting}>
        {isSubmitting || form.formState.isSubmitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}

function Field({ label, htmlFor, error, children }: { label: string; htmlFor: string; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      <p className="min-h-4 text-xs text-destructive">{error}</p>
    </div>
  );
}
