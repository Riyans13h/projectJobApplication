"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ContactForm } from "@/components/forms/ContactForm";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { contactService } from "@/services/contact.service";
import type { ContactPayload } from "@/types/contact";

export default function CreateContactPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const createContact = useMutation({
    mutationFn: (payload: ContactPayload) => contactService.create(payload),
    onSuccess: async (contact) => {
      await queryClient.invalidateQueries({ queryKey: ["contacts"] });
      router.push(`/contacts/${contact.id}`);
    },
    onError: () => setError("Could not save the contact. Check the backend connection and required fields."),
  });

  return (
    <DashboardShell>
      <div className="flex items-start justify-between gap-4">
        <Header title="New contact" description="Add a networking contact and follow-up details." />
        <Button asChild variant="outline">
          <Link href="/contacts">Back</Link>
        </Button>
      </div>
      <Card className="max-w-5xl">
        <CardContent className="pt-5">
          <ContactForm
            error={error}
            isSubmitting={createContact.isPending}
            submitLabel="Create contact"
            onSubmit={(payload) => {
              setError(null);
              createContact.mutate(payload);
            }}
          />
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
