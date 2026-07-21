import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getCategoriesWithCounts } from "@/lib/posts";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/blog/page-header";
import { EmptyState } from "@/components/blog/empty-state";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Categories",
  description: "Browse all article categories.",
  path: "/category",
});

export default async function CategoriesPage() {
  const categories = await getCategoriesWithCounts();

  return (
    <>
      <PageHeader
        eyebrow="Browse by topic"
        title="Categories"
        description="Find articles grouped by the topics you care about most."
      />
      <div className="container py-12">
        {categories.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-heading text-lg font-semibold transition-colors group-hover:text-primary">
                    {c.name}
                  </h2>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
                {c.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
                )}
                <p className="mt-4 text-xs font-medium text-muted-foreground">
                  {c.count} article{c.count === 1 ? "" : "s"}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="No categories yet" />
        )}
      </div>
    </>
  );
}
