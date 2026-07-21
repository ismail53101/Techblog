import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublishedPosts, getTagBySlug } from "@/lib/posts";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/blog/page-header";
import { PostGrid } from "@/components/blog/post-grid";
import { Pagination } from "@/components/blog/pagination";
import { EmptyState } from "@/components/blog/empty-state";
import { Breadcrumbs, type Crumb } from "@/components/blog/breadcrumbs";

export const revalidate = 300;

type Props = { params: { slug: string }; searchParams: { page?: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tag = await getTagBySlug(params.slug);
  if (!tag) return buildMetadata({ title: "Tag not found", noIndex: true });
  return buildMetadata({
    title: `#${tag.name}`,
    description: `Articles tagged “${tag.name}”.`,
    path: `/tag/${tag.slug}`,
  });
}

export default async function TagPage({ params, searchParams }: Props) {
  const tag = await getTagBySlug(params.slug);
  if (!tag) notFound();

  const page = Math.max(1, Number(searchParams.page) || 1);
  const { posts, totalPages } = await getPublishedPosts({ page, tagSlug: tag.slug });

  const crumbs: Crumb[] = [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: `#${tag.name}` },
  ];

  return (
    <>
      <PageHeader eyebrow="Tag" title={`#${tag.name}`} description={`Everything tagged “${tag.name}”.`} />
      <div className="container py-12">
        <Breadcrumbs items={crumbs} className="mb-8" />
        {posts.length ? (
          <PostGrid posts={posts} priorityCount={3} />
        ) : (
          <EmptyState title={`No articles tagged “${tag.name}” yet`} />
        )}
        <Pagination page={page} totalPages={totalPages} basePath={`/tag/${tag.slug}`} />
      </div>
    </>
  );
}
