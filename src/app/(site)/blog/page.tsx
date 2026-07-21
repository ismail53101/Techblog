import type { Metadata } from "next";
import { getPublishedPosts } from "@/lib/posts";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/blog/page-header";
import { PostGrid } from "@/components/blog/post-grid";
import { Pagination } from "@/components/blog/pagination";
import { EmptyState } from "@/components/blog/empty-state";

export const metadata: Metadata = buildMetadata({
  title: "Blog",
  description: "In-depth guides, reviews, and how-tos across AI, software, security, and the web.",
  path: "/blog",
});

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const { posts, totalPages } = await getPublishedPosts({ page });

  return (
    <>
      <PageHeader
        eyebrow="All articles"
        title="The Blog"
        description="Every guide, review, and how-to we've published — freshest first."
      />
      <div className="container py-12">
        {posts.length ? (
          <PostGrid posts={posts} priorityCount={3} />
        ) : (
          <EmptyState
            title="No articles yet"
            description="New articles will show up here as soon as they're published."
          />
        )}
        <Pagination page={page} totalPages={totalPages} basePath="/blog" />
      </div>
    </>
  );
}
