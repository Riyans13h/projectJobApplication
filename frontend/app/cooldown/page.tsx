"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarClock,
  CheckCircle2,
  Download,
  FileUp,
  Hourglass,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { FormEvent, Fragment, useMemo, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "@/components/ui/loader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cooldownService } from "@/services/cooldown.service";
import type { CompanyCooldown, CompanyCooldownPayload } from "@/types/application";
import { downloadCsv, timestampedCsvName } from "@/utils/csv";

type DeleteTarget = {
  id: number;
  label: string;
};

export default function CooldownPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [bulkError, setBulkError] = useState("");
  const [applyAnywayId, setApplyAnywayId] = useState<number | null>(null);
  const [applyAnywayNote, setApplyAnywayNote] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [form, setForm] = useState({
    companyName: "",
    role: "",
    lastAppliedDate: new Date().toISOString().slice(0, 10),
    cooldownPeriod: "30",
    updateExisting: true,
  });

  const activeCooldowns = useQuery({
    queryKey: ["cooldown", "active"],
    queryFn: cooldownService.active,
    refetchInterval: 60_000,
  });

  const almostEligibleCooldowns = useQuery({
    queryKey: ["cooldown", "almost-eligible"],
    queryFn: cooldownService.almostEligible,
    refetchInterval: 60_000,
  });

  const cooldownHistory = useQuery({
    queryKey: ["cooldown", "history"],
    queryFn: cooldownService.history,
  });

  const cooldownTemplates = useQuery({
    queryKey: ["cooldown", "templates"],
    queryFn: cooldownService.templates,
  });

  const createCooldown = useMutation({
    mutationFn: cooldownService.create,
    onSuccess: async () => {
      setForm({
        companyName: "",
        role: "",
        lastAppliedDate: new Date().toISOString().slice(0, 10),
        cooldownPeriod: "30",
        updateExisting: true,
      });
      await refreshCooldowns(queryClient);
    },
  });

  const bulkCreateCooldowns = useMutation({
    mutationFn: cooldownService.bulkCreate,
    onSuccess: async () => {
      setBulkText("");
      setBulkError("");
      await refreshCooldowns(queryClient);
    },
  });

  const applyAnyway = useMutation({
    mutationFn: cooldownService.applyAnyway,
    onSuccess: async () => {
      setApplyAnywayId(null);
      setApplyAnywayNote("");
      await refreshCooldowns(queryClient);
    },
  });

  const deleteCooldown = useMutation({
    mutationFn: cooldownService.remove,
    onSuccess: async () => {
      setDeleteTarget(null);
      await refreshCooldowns(queryClient);
    },
  });

  const filteredCooldowns = useMemo(() => filterCooldowns(activeCooldowns.data ?? [], query), [activeCooldowns.data, query]);
  const filteredAlmostEligible = useMemo(
    () => filterCooldowns(almostEligibleCooldowns.data ?? [], query),
    [almostEligibleCooldowns.data, query]
  );
  const filteredHistory = useMemo(() => filterCooldowns(cooldownHistory.data ?? [], query), [cooldownHistory.data, query]);

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = buildPayload(form);
    if (!payload) {
      return;
    }

    createCooldown.mutate(payload);
  };

  const handleBulkImport = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = parseBulkCooldowns(bulkText);
    if (typeof parsed === "string") {
      setBulkError(parsed);
      return;
    }

    setBulkError("");
    bulkCreateCooldowns.mutate(parsed);
  };

  const handleApplyAnyway = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!applyAnywayId || !applyAnywayNote.trim()) {
      return;
    }

    applyAnyway.mutate({ id: applyAnywayId, note: applyAnywayNote.trim() });
  };

  const exportCooldowns = () => {
    downloadCsv<CompanyCooldown>(timestampedCsvName("jobflow-cooldowns"), [...filteredCooldowns, ...filteredAlmostEligible, ...filteredHistory], [
      { header: "Company", value: (row) => row.companyName },
      { header: "Role", value: (row) => row.role },
      { header: "Severity", value: (row) => row.severity },
      { header: "Source", value: (row) => row.source },
      { header: "Last Applied Date", value: (row) => row.lastAppliedDate },
      { header: "Cooldown Period", value: (row) => row.cooldownPeriod },
      { header: "Eligible Reapply Date", value: (row) => row.eligibleReapplyDate },
      { header: "Days Remaining", value: (row) => row.daysRemaining },
      { header: "Apply Anyway Note", value: (row) => row.applyAnywayNote },
      { header: "Message", value: (row) => row.message },
      { header: "Created At", value: (row) => row.createdAt },
    ]);
  };

  return (
    <DashboardShell>
      <div className="space-y-5">
        <Header title="Cooldown" description="Manage company and role-wise reapply windows with warnings, history, and CSV support." />

        <div className="grid gap-3 md:grid-cols-4">
          <SummaryCard label="Active cooldowns" value={activeCooldowns.data?.length ?? 0} icon={<Hourglass className="h-4 w-4" />} />
          <SummaryCard label="Almost eligible" value={almostEligibleCooldowns.data?.length ?? 0} icon={<CalendarClock className="h-4 w-4" />} />
          <SummaryCard label="Completed history" value={cooldownHistory.data?.length ?? 0} icon={<CheckCircle2 className="h-4 w-4" />} />
          <SummaryCard label="High severity" value={(activeCooldowns.data ?? []).filter((item) => item.severity === "HIGH").length} icon={<ShieldAlert className="h-4 w-4" />} />
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Add cooldown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {(cooldownTemplates.data ?? []).map((template) => (
                  <button
                    key={template.name}
                    type="button"
                    className="rounded-lg border p-3 text-left text-sm transition hover:border-primary hover:bg-secondary"
                    onClick={() => setForm((current) => ({ ...current, cooldownPeriod: String(template.cooldownPeriod) }))}
                  >
                    <span className="block font-semibold">{template.name}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{template.cooldownPeriod} days</span>
                  </button>
                ))}
              </div>

              <form className="grid gap-3 md:grid-cols-2" onSubmit={handleCreate}>
                <Field label="Company" htmlFor="companyName">
                  <Input
                    id="companyName"
                    value={form.companyName}
                    onChange={(event) => setForm((current) => ({ ...current, companyName: event.target.value }))}
                  />
                </Field>
                <Field label="Role optional" htmlFor="role">
                  <Input id="role" value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} />
                </Field>
                <Field label="Last applied date" htmlFor="lastAppliedDate">
                  <Input
                    id="lastAppliedDate"
                    type="date"
                    value={form.lastAppliedDate}
                    onChange={(event) => setForm((current) => ({ ...current, lastAppliedDate: event.target.value }))}
                  />
                </Field>
                <Field label="Cooldown days" htmlFor="cooldownPeriod">
                  <Input
                    id="cooldownPeriod"
                    type="number"
                    min={1}
                    max={365}
                    value={form.cooldownPeriod}
                    onChange={(event) => setForm((current) => ({ ...current, cooldownPeriod: event.target.value }))}
                  />
                </Field>
                <label className="flex items-center gap-2 text-sm md:col-span-2">
                  <input
                    type="checkbox"
                    checked={form.updateExisting}
                    onChange={(event) => setForm((current) => ({ ...current, updateExisting: event.target.checked }))}
                  />
                  Update existing cooldown when company and role already match.
                </label>
                <div className="md:col-span-2">
                  <Button type="submit" disabled={createCooldown.isPending || !form.companyName.trim()}>
                    {createCooldown.isPending ? <Loader className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                    Add cooldown
                  </Button>
                </div>
              </form>

              {createCooldown.isError ? <ErrorBox message="Could not add cooldown. Check company, date, and cooldown days." /> : null}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Cooldowns</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Active, almost eligible, and completed cooldowns in one place.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{filteredCooldowns.length} active</Badge>
              <Button type="button" variant="outline" size="sm" onClick={exportCooldowns}>
                <Download className="mr-2 h-4 w-4" />
                CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search company, role, severity, or note" />
            </div>

            <CooldownSection
              title="Active cooldowns"
              description="Warnings still active today."
              items={filteredCooldowns}
              loading={activeCooldowns.isLoading}
              error={activeCooldowns.isError}
              emptyLabel="No active cooldowns found."
              onDelete={(cooldown) => setDeleteTarget({ id: cooldown.id, label: formatCompanyRole(cooldown.companyName, cooldown.role) })}
              applyAnywayId={applyAnywayId}
              applyAnywayNote={applyAnywayNote}
              setApplyAnywayId={setApplyAnywayId}
              setApplyAnywayNote={setApplyAnywayNote}
              onApplyAnyway={handleApplyAnyway}
              isApplying={applyAnyway.isPending}
            />

            <CooldownSection
              title="Almost eligible"
              description="Cooldowns expiring in the next 14 days."
              items={filteredAlmostEligible}
              loading={almostEligibleCooldowns.isLoading}
              error={almostEligibleCooldowns.isError}
              emptyLabel="No almost eligible cooldowns right now."
              onDelete={(cooldown) => setDeleteTarget({ id: cooldown.id, label: formatCompanyRole(cooldown.companyName, cooldown.role) })}
            />

            <CooldownSection
              title="Cooldown history"
              description="Completed cooldowns stay here until you delete them."
              items={filteredHistory}
              loading={cooldownHistory.isLoading}
              error={cooldownHistory.isError}
              emptyLabel="No completed cooldown history yet."
              onDelete={(cooldown) => setDeleteTarget({ id: cooldown.id, label: formatCompanyRole(cooldown.companyName, cooldown.role) })}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bulk import</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Add one cooldown per line: company, role optional, last applied date, cooldown days.
            </p>
            <form className="space-y-3" onSubmit={handleBulkImport}>
              <textarea
                className="min-h-28 w-full rounded-lg border bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={bulkText}
                onChange={(event) => setBulkText(event.target.value)}
                placeholder={"Google, Frontend Engineer, 2026-05-01, 90\nNetflix, , 2026-04-15, 60"}
              />
              {bulkError ? <ErrorBox message={bulkError} /> : null}
              {bulkCreateCooldowns.isError ? <ErrorBox message="Bulk import failed. Check the values and try again." /> : null}
              <Button type="submit" variant="outline" disabled={bulkCreateCooldowns.isPending || !bulkText.trim()}>
                {bulkCreateCooldowns.isPending ? <Loader className="mr-2 h-4 w-4" /> : <FileUp className="mr-2 h-4 w-4" />}
                Import cooldowns
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete cooldown"
        description={`Delete cooldown for ${deleteTarget?.label ?? "this company"}?`}
        confirmLabel="Delete"
        isConfirming={deleteCooldown.isPending}
        onConfirm={() => deleteTarget && deleteCooldown.mutate(deleteTarget.id)}
      />
    </DashboardShell>
  );
}

function CooldownSection({
  title,
  description,
  items,
  loading,
  error,
  emptyLabel,
  onDelete,
  applyAnywayId,
  applyAnywayNote,
  setApplyAnywayId,
  setApplyAnywayNote,
  onApplyAnyway,
  isApplying,
}: {
  title: string;
  description: string;
  items: CompanyCooldown[];
  loading: boolean;
  error: boolean;
  emptyLabel: string;
  onDelete: (cooldown: CompanyCooldown) => void;
  applyAnywayId?: number | null;
  applyAnywayNote?: string;
  setApplyAnywayId?: (id: number | null) => void;
  setApplyAnywayNote?: (note: string) => void;
  onApplyAnyway?: (event: FormEvent<HTMLFormElement>) => void;
  isApplying?: boolean;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {loading ? <Loader /> : null}
      {error ? <ErrorBox message={`Could not load ${title.toLowerCase()}.`} /> : null}
      {!loading && !error && items.length === 0 ? <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">{emptyLabel}</div> : null}
      {!loading && !error && items.length > 0 ? (
        <div className="overflow-hidden rounded-lg border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                  <TableHead className="min-w-48">Company</TableHead>
                  <TableHead className="min-w-36">Status</TableHead>
                  <TableHead className="min-w-52">Counter</TableHead>
                  <TableHead className="min-w-32">Eligible</TableHead>
                  <TableHead className="min-w-32">Last Applied</TableHead>
                  <TableHead className="min-w-56">Note</TableHead>
                  <TableHead className="w-28 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((cooldown) => (
                  <Fragment key={cooldown.id}>
                    <CooldownTableRow
                      cooldown={cooldown}
                      onDelete={() => onDelete(cooldown)}
                      applyAnywayId={applyAnywayId}
                      applyAnywayNote={applyAnywayNote}
                      setApplyAnywayId={setApplyAnywayId}
                      setApplyAnywayNote={setApplyAnywayNote}
                      isApplying={isApplying}
                    />
                    {applyAnywayId === cooldown.id && setApplyAnywayId && setApplyAnywayNote && onApplyAnyway ? (
                      <TableRow className="bg-secondary/20 hover:bg-secondary/20">
                        <TableCell colSpan={7}>
                          <form className="flex flex-col gap-2 sm:flex-row sm:items-center" onSubmit={onApplyAnyway}>
                            <Input
                              value={applyAnywayNote ?? ""}
                              onChange={(event) => setApplyAnywayNote(event.target.value)}
                              placeholder="Reason for applying anyway"
                            />
                            <div className="flex shrink-0 gap-2">
                              <Button type="submit" size="sm" disabled={isApplying || !applyAnywayNote?.trim()}>
                                {isApplying ? <Loader className="mr-2 h-4 w-4" /> : null}
                                Save note
                              </Button>
                              <Button type="button" size="sm" variant="outline" onClick={() => setApplyAnywayId(null)}>
                                Cancel
                              </Button>
                            </div>
                          </form>
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function CooldownTableRow({
  cooldown,
  onDelete,
  applyAnywayId,
  applyAnywayNote,
  setApplyAnywayId,
  setApplyAnywayNote,
  onApplyAnyway,
  isApplying,
}: {
  cooldown: CompanyCooldown;
  onDelete: () => void;
  applyAnywayId?: number | null;
  applyAnywayNote?: string;
  setApplyAnywayId?: (id: number | null) => void;
  setApplyAnywayNote?: (note: string) => void;
  onApplyAnyway?: (event: FormEvent<HTMLFormElement>) => void;
  isApplying?: boolean;
}) {
  const isApplyFormOpen = applyAnywayId === cooldown.id;
  const counter = getCooldownCounter(cooldown);

  return (
    <TableRow>
      <TableCell>
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            <Hourglass className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold">{cooldown.companyName}</p>
            <p className="truncate text-xs text-muted-foreground">{cooldown.role || "All roles"}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap items-center gap-2">
        <SeverityBadge severity={cooldown.severity} active={cooldown.cooldownActive} daysRemaining={cooldown.daysRemaining} />
        {cooldown.source ? <Badge>{formatLabel(cooldown.source)}</Badge> : null}
        {cooldown.applyAnywayNote ? <Badge>Apply anyway noted</Badge> : null}
        </div>
      </TableCell>
      <TableCell>
        <CooldownProgress counter={counter} />
      </TableCell>
      <TableCell>
        <p className="font-medium">{formatDate(cooldown.eligibleReapplyDate)}</p>
        <p className="text-xs text-muted-foreground">{counter.active ? `${counter.daysRemaining} day(s) left` : "Ready now"}</p>
      </TableCell>
      <TableCell>
        <p className="font-medium">{formatDate(cooldown.lastAppliedDate)}</p>
        <p className="text-xs text-muted-foreground">Suggested {formatDate(cooldown.suggestedReapplyDate)}</p>
      </TableCell>
      <TableCell>
        <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">{cooldown.applyAnywayNote || cooldown.message}</p>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          {setApplyAnywayId && setApplyAnywayNote && cooldown.cooldownActive ? (
            <Button
              type="button"
              size="sm"
              variant={isApplyFormOpen ? "secondary" : "outline"}
              onClick={() => {
                setApplyAnywayId(isApplyFormOpen ? null : cooldown.id);
                setApplyAnywayNote(isApplyFormOpen ? "" : cooldown.applyAnywayNote ?? "");
              }}
            >
              Note
            </Button>
          ) : null}
          <Button variant="ghost" size="icon" aria-label="Delete cooldown" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function CooldownProgress({ counter }: { counter: CooldownCounterState }) {
  const label = counter.active ? `${counter.daysRemaining}d left` : "Ready";
  const barClassName = counter.active
    ? counter.daysRemaining > 60
      ? "bg-red-500"
      : counter.daysRemaining >= 15
        ? "bg-amber-500"
        : "bg-blue-500"
    : "bg-emerald-500";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-semibold">{label}</span>
        <span className="text-muted-foreground">{counter.progress}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className={`h-full rounded-full ${barClassName}`} style={{ width: `${counter.progress}%` }} />
      </div>
      <p className="text-xs text-muted-foreground">{counter.completedDays}/{counter.totalDays} days done</p>
    </div>
  );
}

function CountdownCounter({ counter }: { counter: CooldownCounterState }) {
  const statusText = counter.active ? `${counter.daysRemaining} day${counter.daysRemaining === 1 ? "" : "s"} left` : "Ready to reapply";
  const barClassName = counter.active
    ? counter.daysRemaining > 60
      ? "bg-red-500"
      : counter.daysRemaining >= 15
        ? "bg-amber-500"
        : "bg-blue-500"
    : "bg-emerald-500";

  return (
    <div className="mt-3 rounded-md border bg-secondary/30 px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">Counter</p>
          <p className="mt-0.5 truncate text-lg font-semibold leading-none">{statusText}</p>
        </div>
        <div className="shrink-0 text-right text-xs text-muted-foreground">
          <p>{counter.progress}% complete</p>
          <p>{counter.completedDays}/{counter.totalDays} days</p>
        </div>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background">
        <div className={`h-full rounded-full ${barClassName}`} style={{ width: `${counter.progress}%` }} />
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-primary">{icon}</span>
      </CardContent>
    </Card>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-medium uppercase text-muted-foreground">{label}</div>
      <div className="mt-0.5 truncate font-medium">{value}</div>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{message}</div>;
}

function SeverityBadge({ severity, active, daysRemaining }: { severity?: string; active: boolean; daysRemaining: number }) {
  if (!active) {
    return <Badge className="border-emerald-300 text-emerald-900 dark:border-emerald-800 dark:text-emerald-100">Eligible</Badge>;
  }

  const label = severity ? formatLabel(severity) : `${daysRemaining} day(s) left`;
  const className =
    severity === "HIGH"
      ? "border-red-300 text-red-800 dark:border-red-900 dark:text-red-200"
      : severity === "MEDIUM"
        ? "border-amber-300 text-amber-800 dark:border-amber-900 dark:text-amber-200"
        : "border-blue-300 text-blue-800 dark:border-blue-900 dark:text-blue-200";

  return (
    <Badge className={className}>
      {label} {daysRemaining > 0 ? `(${daysRemaining}d)` : ""}
    </Badge>
  );
}

function buildPayload(form: {
  companyName: string;
  role: string;
  lastAppliedDate: string;
  cooldownPeriod: string;
  updateExisting: boolean;
}): CompanyCooldownPayload | null {
  const companyName = form.companyName.trim();
  const role = form.role.trim();
  const cooldownPeriod = Number(form.cooldownPeriod);
  if (!companyName || !form.lastAppliedDate || !Number.isFinite(cooldownPeriod)) {
    return null;
  }

  return {
    companyName,
    role: role || undefined,
    lastAppliedDate: form.lastAppliedDate,
    cooldownPeriod,
    updateExisting: form.updateExisting,
  };
}

function parseBulkCooldowns(value: string): CompanyCooldownPayload[] | string {
  const lines = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return "Add at least one cooldown row.";
  }

  const rows: CompanyCooldownPayload[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const parts = line.split(",").map((part: string) => part.trim());
    if (parts.length < 3) {
      return `Line ${index + 1} needs company, date, and cooldown days.`;
    }

    const companyName = parts[0];
    const lastAppliedDate = parts.length === 3 ? parts[1] : parts[2];
    const cooldownPeriod = Number(parts.length === 3 ? parts[2] : parts[3]);
    const role = parts.length === 3 ? "" : parts[1];

    if (!companyName || !lastAppliedDate || !Number.isFinite(cooldownPeriod)) {
      return `Line ${index + 1} has invalid values.`;
    }

    rows.push({
      companyName,
      role: role || undefined,
      lastAppliedDate,
      cooldownPeriod,
      updateExisting: true,
    });
  }

  return rows;
}

function filterCooldowns(items: CompanyCooldown[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return items;
  }

  return items.filter((item) => {
    const values = [item.companyName, item.role, item.message, item.severity, item.source, item.applyAnywayNote]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return values.includes(normalizedQuery);
  });
}

type CooldownCounterState = {
  active: boolean;
  daysRemaining: number;
  completedDays: number;
  totalDays: number;
  progress: number;
};

function getCooldownCounter(cooldown: CompanyCooldown): CooldownCounterState {
  const totalDays = Math.max(0, cooldown.cooldownPeriod ?? 0);
  const dateBasedRemaining = calculateDaysUntil(cooldown.eligibleReapplyDate);
  const daysRemaining = Math.max(0, dateBasedRemaining ?? cooldown.daysRemaining ?? 0);
  const active = cooldown.cooldownActive && daysRemaining > 0;
  const completedDays = Math.min(totalDays, Math.max(0, totalDays - daysRemaining));
  const progress = totalDays > 0 ? Math.min(100, Math.max(0, Math.round((completedDays / totalDays) * 100))) : active ? 0 : 100;

  return {
    active,
    daysRemaining,
    completedDays,
    totalDays,
    progress,
  };
}

function calculateDaysUntil(value?: string) {
  if (!value) {
    return null;
  }

  const target = new Date(value);
  if (Number.isNaN(target.getTime())) {
    return null;
  }

  const today = startOfLocalDay(new Date());
  const targetDay = startOfLocalDay(target);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.ceil((targetDay.getTime() - today.getTime()) / millisecondsPerDay));
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

async function refreshCooldowns(queryClient: ReturnType<typeof useQueryClient>) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["cooldown", "active"] }),
    queryClient.invalidateQueries({ queryKey: ["cooldown", "almost-eligible"] }),
    queryClient.invalidateQueries({ queryKey: ["cooldown", "history"] }),
    queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
  ]);
}

function formatCompanyRole(companyName: string, role?: string) {
  return role ? `${companyName} - ${role}` : companyName;
}

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value?: string) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
