"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BriefcaseBusiness, CalendarDays, Clock3, FileText, MessageSquareText, Save, Video } from "lucide-react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Application } from "@/types/application";
import type { Interview, InterviewPayload } from "@/types/interview";
import { cn } from "@/utils/cn";

const schema = z.object({
  applicationId: z.coerce.number().optional(),
  roundName: z.string().min(1, "Round name is required").max(150, "Round name must be 150 characters or less"),
  interviewDate: z.string().min(1, "Interview date is required"),
  interviewTime: z.string().min(1, "Interview time is required"),
  mode: z.enum(["PHONE", "VIDEO", "ONSITE", "ONLINE_ASSESSMENT"]),
  result: z.enum(["PENDING", "PASSED", "REJECTED", "CANCELLED", "NO_SHOW"]),
  notes: z.string().optional(),
});

type RawFormValues = z.infer<typeof schema>;

export interface InterviewFormSubmit {
  applicationId?: number;
  payload: InterviewPayload;
}

interface InterviewFormProps {
  applications?: Application[];
  initialValue?: Interview;
  onSubmit?: (values: InterviewFormSubmit) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  error?: string | null;
  showApplicationSelect?: boolean;
}

const inputLike =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

function splitDateTime(value?: string) {
  if (!value) {
    return { date: todayValue(), time: "10:00" };
  }

  return {
    date: value.slice(0, 10),
    time: value.slice(11, 16) || "10:00",
  };
}

export function InterviewForm({
  applications = [],
  initialValue,
  onSubmit,
  submitLabel = "Save interview",
  isSubmitting,
  error,
  showApplicationSelect = false,
}: InterviewFormProps) {
  const dateParts = splitDateTime(initialValue?.interviewDate);
  const form = useForm<RawFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      applicationId: initialValue?.applicationId ?? applications[0]?.id,
      roundName: initialValue?.roundName ?? "",
      interviewDate: dateParts.date,
      interviewTime: dateParts.time,
      mode: initialValue?.mode ?? "VIDEO",
      result: initialValue?.result ?? "PENDING",
      notes: initialValue?.notes ?? "",
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    if (showApplicationSelect && !values.applicationId) {
      form.setError("applicationId", { message: "Application is required" });
      return;
    }

    return onSubmit?.({
      applicationId: values.applicationId,
      payload: {
        roundName: values.roundName.trim(),
        interviewDate: `${values.interviewDate}T${values.interviewTime}:00`,
        mode: values.mode,
        result: values.result,
        notes: values.notes?.trim() || undefined,
      },
    });
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error ? <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}

      <div className="rounded-lg border bg-secondary/25 p-3">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <CalendarDays className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold">Round details</p>
            <p className="text-xs text-muted-foreground">Choose the application, time, mode, and current result.</p>
          </div>
        </div>

        <div className="grid gap-x-4 gap-y-2 md:grid-cols-2">
          {showApplicationSelect ? (
            <Field className="md:col-span-2" label="Application" htmlFor="applicationId" icon={<BriefcaseBusiness className="h-4 w-4" />} error={form.formState.errors.applicationId?.message}>
              <select id="applicationId" className={inputLike} {...form.register("applicationId")}>
                {applications.length === 0 ? <option value="">No applications available</option> : null}
                {applications.map((application) => (
                  <option key={application.id} value={application.id}>
                    {application.companyName} - {application.role}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}

          <Field label="Round name" htmlFor="roundName" icon={<MessageSquareText className="h-4 w-4" />} error={form.formState.errors.roundName?.message}>
            <Input id="roundName" placeholder="Technical round" {...form.register("roundName")} />
          </Field>
          <Field label="Mode" htmlFor="mode" icon={<Video className="h-4 w-4" />} error={form.formState.errors.mode?.message}>
            <select id="mode" className={inputLike} {...form.register("mode")}>
              <option value="PHONE">Phone</option>
              <option value="VIDEO">Video</option>
              <option value="ONSITE">Onsite</option>
              <option value="ONLINE_ASSESSMENT">Online assessment</option>
            </select>
          </Field>
          <Field label="Date" htmlFor="interviewDate" icon={<CalendarDays className="h-4 w-4" />} error={form.formState.errors.interviewDate?.message}>
            <Input id="interviewDate" type="date" {...form.register("interviewDate")} />
          </Field>
          <Field label="Time" htmlFor="interviewTime" icon={<Clock3 className="h-4 w-4" />} error={form.formState.errors.interviewTime?.message}>
            <Input id="interviewTime" type="time" {...form.register("interviewTime")} />
          </Field>
          <Field label="Result" htmlFor="result" icon={<FileText className="h-4 w-4" />} error={form.formState.errors.result?.message}>
            <select id="result" className={inputLike} {...form.register("result")}>
              <option value="PENDING">Pending</option>
              <option value="PASSED">Passed</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="NO_SHOW">No show</option>
            </select>
          </Field>
        </div>
      </div>

      <div className="space-y-2 rounded-lg border p-3">
        <Label htmlFor="notes" className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4 text-muted-foreground" />
          Notes
        </Label>
        <textarea id="notes" rows={3} placeholder="Add prep notes, interviewer name, or meeting link." className={cn(inputLike, "h-auto resize-y py-2")} {...form.register("notes")} />
        <p className="min-h-4 text-xs text-destructive">{form.formState.errors.notes?.message}</p>
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="min-w-36" disabled={isSubmitting || form.formState.isSubmitting || (showApplicationSelect && applications.length === 0)}>
          {isSubmitting || form.formState.isSubmitting ? null : <Save className="mr-2 h-4 w-4" />}
          {isSubmitting || form.formState.isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  icon,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor} className="flex items-center gap-2 text-sm">
        {icon ? <span className="text-muted-foreground">{icon}</span> : null}
        {label}
      </Label>
      {children}
      <p className="min-h-4 text-xs text-destructive">{error}</p>
    </div>
  );
}
