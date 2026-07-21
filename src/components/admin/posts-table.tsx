"use client";

import * as React from "react";
import Link from "next/link";
import { ExternalLink, Pencil, PlusCircle, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useDebounce } from "@/hooks/use-debounce";
import { formatDate, cn } from "@/lib/utils";

type Row = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED";
  featured: boolean;
  views: number;
  publishedAt: string | null;
  updatedAt: string;
  category: { name: string; slug: string } | null;
  author: { name: string };
};

const statusStyles: Record<string, string> = {
  PUBLISHED: "bg-green-500/15 text-green-600 dark:text-green-400",
  DRAFT: "bg-muted text-muted-foreground",
  SCHEDULED: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
};

export function PostsTable() {
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [status, setStatus] = React.useState("");
  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const debouncedQ = useDebounce(q, 300);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (debouncedQ) params.set("q", debouncedQ);
      params.set("page", String(page));
      const res = await fetch(`/api/posts?${params}`);
      const data = await res.json();
      setRows(data.posts ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      toast.error("Could not load posts");
    } finally {
      setLoading(false);
    }
  }, [status, debouncedQ, page]);

  React.useEffect(() => {
    load();
  }, [load]);

  React.useEffect(() => {
    setPage(1);
  }, [status, debouncedQ]);

  async function remove(row: Row) {
    if (!window.confirm(`Delete “${row.title}”? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/posts/${row.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Post deleted");
        setRows((r) => r.filter((x) => x.id !== row.id));
      } else {
        const d = await res.json().catch(() => ({}));
        toast.error(d.error || "Could not delete post");
      }
    } catch {
      toast.error("Network error");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold">Posts</h1>
        <Link href="/admin/posts/new" className={cn(buttonVariants())}>
          <PlusCircle className="size-4" />
          New article
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search posts…" className="pl-9" />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="sm:max-w-[180px]">
          <option value="">All statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="SCHEDULED">Scheduled</option>
        </Select>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-muted-foreground">
            <Spinner /> Loading…
          </div>
        ) : rows.length === 0 ? (
          <p className="p-12 text-center text-sm text-muted-foreground">No posts found.</p>
        ) : (
          <div className="divide-y divide-border">
            {rows.map((row) => (
              <div key={row.id} className="flex items-center gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/posts/${row.id}/edit`} className="line-clamp-1 font-medium hover:text-primary">
                      {row.title}
                    </Link>
                    {row.featured && (
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {row.category?.name || "Uncategorized"} · {row.author.name} · updated{" "}
                    {formatDate(row.updatedAt)} · {row.views.toLocaleString()} views
                  </p>
                </div>
                <span className={cn("hidden shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium sm:inline", statusStyles[row.status])}>
                  {row.status.toLowerCase()}
                </span>
                <div className="flex shrink-0 items-center gap-1">
                  {row.status === "PUBLISHED" && (
                    <a
                      href={`/blog/${row.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="View"
                      className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <ExternalLink className="size-4" />
                    </a>
                  )}
                  <Link
                    href={`/admin/posts/${row.id}/edit`}
                    aria-label="Edit"
                    className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <Pencil className="size-4" />
                  </Link>
                  <button
                    type="button"
                    aria-label="Delete"
                    onClick={() => remove(row)}
                    className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
