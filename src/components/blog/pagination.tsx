import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function buildHref(basePath: string, page: number, query: Record<string, string> = {}) {
  const params = new URLSearchParams(query);
  if (page > 1) params.set("page", String(page));
  else params.delete("page");
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function pageWindow(current: number, total: number): (number | "…")[] {
  const pages: (number | "…")[] = [];
  const add = (n: number) => pages.push(n);
  const delta = 1;
  const range: number[] = [];
  for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) range.push(i);
  if (range[0]! > 1) {
    add(1);
    if (range[0]! > 2) pages.push("…");
  }
  range.forEach(add);
  if (range[range.length - 1]! < total) {
    if (range[range.length - 1]! < total - 1) pages.push("…");
    add(total);
  }
  return pages;
}

export function Pagination({
  page,
  totalPages,
  basePath,
  query = {},
}: {
  page: number;
  totalPages: number;
  basePath: string;
  query?: Record<string, string>;
}) {
  if (totalPages <= 1) return null;
  const pages = pageWindow(page, totalPages);

  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link
          href={buildHref(basePath, page - 1, query)}
          className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
          aria-label="Previous page"
          rel="prev"
        >
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <span className={cn(buttonVariants({ variant: "outline", size: "icon" }), "pointer-events-none opacity-40")}>
          <ChevronLeft className="size-4" />
        </span>
      )}

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-2 text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(basePath, p, query)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              buttonVariants({ variant: p === page ? "default" : "outline", size: "icon" }),
              "tabular-nums"
            )}
          >
            {p}
          </Link>
        )
      )}

      {page < totalPages ? (
        <Link
          href={buildHref(basePath, page + 1, query)}
          className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
          aria-label="Next page"
          rel="next"
        >
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span className={cn(buttonVariants({ variant: "outline", size: "icon" }), "pointer-events-none opacity-40")}>
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
