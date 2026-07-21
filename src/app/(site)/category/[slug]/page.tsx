import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategoryBySlug, getPublishedPosts } from "@/lib/posts";
import { buildMetadata, jsonLdBreadcrumb } from "@/lib/seo";
import { absoluteUrl } from "@/lib/utils";
import { PageHeader } from "@/components/blog/page-header";
import { PostGrid } from "@/components/blog/post-grid";
import { Pagination } from "@/components/blog/pagination";
import { EmptyState } from "@/components/blog/empty-state";
import { Breadcrumbs, type Crumb } from "@/components/blog/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";

export const revalidate = 300;

type Props = { params: { slug: string }; searchParams: { page?: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug);
  if (!category) return buildMetadata({ title: "Category not found", noIndex: true });
  return buildMetadata({
    title: category.name,
    description: category.description || `Articles in ${category.name}.`,
    path: `/category/${category.slug}`,
  });
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) notFound();

  const page = Math.max(1, Number(searchParams.page) || 1);
  const { posts, totalPages } = await getPublishedPosts({ page, categorySlug: category.slug });

  const crumbs: Crumb[] = [
    { name: "Home", href: "/" },
    { name: "Categories", href: "/category" },
    { name: category.name },
  ];

  return (
    <>
      <JsonLd
        data={jsonLdBreadcrumb(
          crumbs.map((c) => ({ name: c.name, url: c.href || absoluteUrl(`/category/${category.slug}`) }))
        )}
      />
      <PageHeader eyebrow="Category" title={category.name} description={category.description || undefined} />
      <div className="container py-12">
        <Breadcrumbs items={crumbs} className="mb-8" />
        {posts.length ? (
          <PostGrid posts={posts} priorityCount={3} />
        ) : (
          <EmptyState title={`No articles in ${category.name} yet`} />
        )}
        <Pagination page={page} totalPages={totalPages} basePath={`/category/${category.slug}`} />
      </div>
    </>
  );
}
