import type { Metadata } from "next";
import { searchPosts } from "@/lib/posts";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/blog/page-header";
import { PostGrid } from "@/components/blog/post-grid";
import { EmptyState } from "@/components/blog/empty-state";
import { SearchInput } from "@/components/blog/search-input";

export const metadata: Metadata = buildMetadata({
  title: "Search",
  description: "Search articles by title, category, or tag.",
  path: "/search",
  noIndex: true,
});

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams.q || "").trim();
  const results = q ? await searchPosts(q, { limit: 30 }) : [];

  return (
    <>
      <PageHeader eyebrow="Search" title="Find an article">
        <SearchInput initialQuery={q} />
      </PageHeader>
      <div className="container py-12">
        {q ? (
          results.length ? (
            <>
              <p className="mb-6 text-sm text-muted-foreground">
                {results.length} result{results.length === 1 ? "" : "s"} for &ldquo;{q}&rdquo;
              </p>
              <PostGrid posts={results} />
            </>
          ) : (
            <EmptyState
              title={`No results for “${q}”`}
              description="Try different keywords, or browse by category."
            />
          )
        ) : (
          <p className="text-muted-foreground">Type a query above to search all articles.</p>
        )}
      </div>
    </>
  );
}
