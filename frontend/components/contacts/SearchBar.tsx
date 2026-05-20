"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  name: string;
  company: string;
  onNameChange: (value: string) => void;
  onCompanyChange: (value: string) => void;
}

export function SearchBar({ name, company, onNameChange, onCompanyChange }: SearchBarProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <label className="relative">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input value={name} onChange={(event) => onNameChange(event.target.value)} placeholder="Search name" className="pl-9" />
      </label>
      <label className="relative">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input value={company} onChange={(event) => onCompanyChange(event.target.value)} placeholder="Search company" className="pl-9" />
      </label>
    </div>
  );
}
