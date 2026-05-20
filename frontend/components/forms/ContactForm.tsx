"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Contact, ContactPayload } from "@/types/contact";
import { cn } from "@/utils/cn";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  company: z.string().max(150).optional(),
  role: z.string().max(150).optional(),
  level: z.string().max(100).optional(),
  linkedinUrl: z.string().url("Use a valid URL").or(z.literal("")).optional(),
  email: z.string().email("Use a valid email").or(z.literal("")).optional(),
  phone: z.string().regex(/^[+]?[0-9\-\s()]{7,30}$/, "Use a valid phone").or(z.literal("")).optional(),
  contactType: z.enum(["REFERRAL", "RECRUITER", "HR", "HIRING_MANAGER", "MENTOR", "COLD_MAIL", "ALUMNI", "FRIEND"]),
  status: z.enum(["NOT_CONTACTED", "MESSAGE_SENT", "RESPONDED", "REFERRAL_GIVEN", "REJECTED", "FOLLOW_UP_NEEDED"]),
  helpScore: z.enum(["ZERO", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN"]).optional(),
  source: z.string().max(150).optional(),
  notes: z.string().optional(),
  lastContactDate: z.string().optional(),
  nextFollowupDate: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface ContactFormProps {
  initialValue?: Contact;
  onSubmit?: (values: ContactPayload) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  error?: string | null;
}

const inputLike =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export function ContactForm({ initialValue, onSubmit, submitLabel = "Save contact", isSubmitting, error }: ContactFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialValue?.name ?? "",
      company: initialValue?.company ?? "",
      role: initialValue?.role ?? "",
      level: initialValue?.level ?? "",
      linkedinUrl: initialValue?.linkedinUrl ?? "",
      email: initialValue?.email ?? "",
      phone: initialValue?.phone ?? "",
      contactType: initialValue?.contactType ?? "REFERRAL",
      status: initialValue?.status ?? "NOT_CONTACTED",
      helpScore: initialValue?.helpScore ?? "ZERO",
      source: initialValue?.source ?? "",
      notes: initialValue?.notes ?? "",
      lastContactDate: initialValue?.lastContactDate ?? "",
      nextFollowupDate: initialValue?.nextFollowupDate ?? "",
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    const payload: ContactPayload = {
      name: values.name.trim(),
      company: values.company?.trim() || undefined,
      role: values.role?.trim() || undefined,
      level: values.level?.trim() || undefined,
      linkedinUrl: values.linkedinUrl?.trim() || undefined,
      email: values.email?.trim() || undefined,
      phone: values.phone?.trim() || undefined,
      contactType: values.contactType,
      status: values.status,
      helpScore: values.helpScore,
      source: values.source?.trim() || undefined,
      notes: values.notes?.trim() || undefined,
      lastContactDate: values.lastContactDate || undefined,
      nextFollowupDate: values.nextFollowupDate || undefined,
    };

    return onSubmit?.(payload);
  });

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error ? <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name" htmlFor="name" error={form.formState.errors.name?.message}>
          <Input id="name" {...form.register("name")} />
        </Field>
        <Field label="Company" htmlFor="company" error={form.formState.errors.company?.message}>
          <Input id="company" {...form.register("company")} />
        </Field>
        <Field label="Role" htmlFor="role" error={form.formState.errors.role?.message}>
          <Input id="role" {...form.register("role")} />
        </Field>
        <Field label="Level" htmlFor="level" error={form.formState.errors.level?.message}>
          <Input id="level" placeholder="Senior, Staff, Director" {...form.register("level")} />
        </Field>
        <Field label="LinkedIn URL" htmlFor="linkedinUrl" error={form.formState.errors.linkedinUrl?.message}>
          <Input id="linkedinUrl" {...form.register("linkedinUrl")} />
        </Field>
        <Field label="Email" htmlFor="email" error={form.formState.errors.email?.message}>
          <Input id="email" type="email" {...form.register("email")} />
        </Field>
        <Field label="Phone" htmlFor="phone" error={form.formState.errors.phone?.message}>
          <Input id="phone" {...form.register("phone")} />
        </Field>
        <Field label="Source" htmlFor="source" error={form.formState.errors.source?.message}>
          <Input id="source" placeholder="LinkedIn, alumni group, referral" {...form.register("source")} />
        </Field>
        <Field label="Contact type" htmlFor="contactType" error={form.formState.errors.contactType?.message}>
          <select id="contactType" className={inputLike} {...form.register("contactType")}>
            <option value="REFERRAL">Referral</option>
            <option value="RECRUITER">Recruiter</option>
            <option value="HR">HR</option>
            <option value="HIRING_MANAGER">Hiring manager</option>
            <option value="MENTOR">Mentor</option>
            <option value="COLD_MAIL">Cold mail</option>
            <option value="ALUMNI">Alumni</option>
            <option value="FRIEND">Friend</option>
          </select>
        </Field>
        <Field label="Status" htmlFor="status" error={form.formState.errors.status?.message}>
          <select id="status" className={inputLike} {...form.register("status")}>
            <option value="NOT_CONTACTED">Not contacted</option>
            <option value="MESSAGE_SENT">Message sent</option>
            <option value="RESPONDED">Responded</option>
            <option value="REFERRAL_GIVEN">Referral given</option>
            <option value="REJECTED">Rejected</option>
            <option value="FOLLOW_UP_NEEDED">Follow-up needed</option>
          </select>
        </Field>
        <Field label="Help score" htmlFor="helpScore" error={form.formState.errors.helpScore?.message}>
          <select id="helpScore" className={inputLike} {...form.register("helpScore")}>
            <option value="ZERO">0 / 10</option>
            <option value="ONE">1 / 10</option>
            <option value="TWO">2 / 10</option>
            <option value="THREE">3 / 10</option>
            <option value="FOUR">4 / 10</option>
            <option value="FIVE">5 / 10</option>
            <option value="SIX">6 / 10</option>
            <option value="SEVEN">7 / 10</option>
            <option value="EIGHT">8 / 10</option>
            <option value="NINE">9 / 10</option>
            <option value="TEN">10 / 10</option>
          </select>
        </Field>
        <Field label="Last contact date" htmlFor="lastContactDate" error={form.formState.errors.lastContactDate?.message}>
          <Input id="lastContactDate" type="date" {...form.register("lastContactDate")} />
        </Field>
        <Field label="Next follow-up date" htmlFor="nextFollowupDate" error={form.formState.errors.nextFollowupDate?.message}>
          <Input id="nextFollowupDate" type="date" {...form.register("nextFollowupDate")} />
        </Field>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <textarea id="notes" rows={4} className={cn(inputLike, "h-auto py-2")} {...form.register("notes")} />
        <p className="text-xs text-destructive">{form.formState.errors.notes?.message}</p>
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
