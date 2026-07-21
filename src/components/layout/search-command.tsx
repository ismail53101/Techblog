"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Loader2, CornerDownLeft, FileText } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

type SearchResult = {
  title: string;
  slug: string;
  excerpt: string;
  readingTime: number;
  category: { name: string; slug: string } | null;
};

export function SearchCommand() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const debounced = useDebounce(query, 250);

  // Global shortcut: Cmd/Ctrl+K toggles, Escape closes.
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Lock body scroll + focus the input when open.
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const t = setTimeout(() => inputRef.current?.focus(), 20);
      return () => {
        clearTimeout(t);
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  // Fetch results.
  React.useEffect(() => {
    if (!open) return;
    const q = debounced.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}&limit=8`)
      .then((r) => r.json())
      .then((d) => {
        if (active) {
          setResults(d.results ?? []);
          setLoading(false);
        }
      })
      .catch(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [debounced, open]);

  function goToResults() {
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
          "md:w-56 md:justify-between"
        )}
      >
        <span className="flex items-center gap-2">
          <Search className="size-4" />
          <span className="hidden md:inline">Search…</span>
        </span>
        <kbd className="hidden rounded border border-border bg-muted px-1.5 font-mono text-[10px] md:inline">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-[12vh] backdrop-blur-sm"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Search articles"
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search className="size-5 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && goToResults()}
                placeholder="Search articles, categories, tags…"
                className="h-14 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
              />
              {loading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
            </div>

            <div className="max-h-[52vh] overflow-y-auto p-2">
              {query.trim() && !loading && results.length === 0 && (
                <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No results for &ldquo;{query.trim()}&rdquo;
                </p>
              )}

              {!query.trim() && (
                <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                  Type to search across all articles.
                </p>
              )}

              <ul className="space-y-1">
                {results.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/blog/${r.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-accent"
                    >
                      <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{r.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {r.category ? `${r.category.name} · ` : ""}
                          {r.readingTime} min read
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {query.trim() && (
              <button
                type="button"
                onClick={goToResults}
                className="flex w-full items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground hover:bg-accent"
              >
                <span>
                  See all results for &ldquo;<span className="text-foreground">{query.trim()}</span>&rdquo;
                </span>
                <CornerDownLeft className="size-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
