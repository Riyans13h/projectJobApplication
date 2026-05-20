"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  company: string;
  role: string;
  onCompanyChange: (value: string) => void;
  onRoleChange: (value: string) => void;
}

export function SearchBar({ company, role, onCompanyChange, onRoleChange }: SearchBarProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <label className="relative">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={company}
          onChange={(event) => onCompanyChange(event.target.value)}
          placeholder="Search company"
          className="pl-9"
        />
      </label>
      <label className="relative">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={role}
          onChange={(event) => onRoleChange(event.target.value)}
          placeholder="Search role"
          className="pl-9"
        />
      </label>
    </div>
  );
}
