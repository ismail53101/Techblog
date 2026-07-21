"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

export function SearchInput({ initialQuery = "" }: { initialQuery?: string }) {
  const [q, setQ] = React.useState(initialQuery);
  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (query) trackEvent("search", { search_term: query });
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-xl gap-2">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search articles…"
          aria-label="Search articles"
          className="pl-9"
          autoFocus
        />
      </div>
      <Button type="submit">Search</Button>
    </form>
  );
}
