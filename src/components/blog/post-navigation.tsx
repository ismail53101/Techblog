import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { AdjacentPosts } from "@/lib/posts";

export function PostNavigation({ prev, next }: AdjacentPosts) {
  if (!prev && !next) return null;

  return (
    <nav aria-label="Article navigation" className="container print:hidden">
      <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2">
        {prev ? (
          <Link
            href={`/blog/${prev.slug}`}
            className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
              Previous article
            </span>
            <span className="mt-1.5 line-clamp-2 font-heading font-semibold leading-snug transition-colors group-hover:text-primary">
              {prev.title}
            </span>
          </Link>
        ) : (
          <span aria-hidden className="hidden sm:block" />
        )}

        {next ? (
          <Link
            href={`/blog/${next.slug}`}
            className="group flex flex-col rounded-2xl border border-border bg-card p-5 text-right transition-colors hover:border-primary/40"
          >
            <span className="inline-flex items-center justify-end gap-1.5 text-xs font-medium text-muted-foreground">
              Next article
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
            <span className="mt-1.5 line-clamp-2 font-heading font-semibold leading-snug transition-colors group-hover:text-primary">
              {next.title}
            </span>
          </Link>
        ) : (
          <span aria-hidden className="hidden sm:block" />
        )}
      </div>
    </nav>
  );
}
