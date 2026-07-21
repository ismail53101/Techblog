import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { Clock, Eye } from "lucide-react";
import { getPublishedPostBySlug, getRelatedPosts, incrementViews } from "@/lib/posts";
import { addHeadingIds, extractToc } from "@/lib/toc";
import { sanitize } from "@/lib/sanitize";
import { buildMetadata, jsonLdArticle, jsonLdBreadcrumb } from "@/lib/seo";
import { absoluteUrl, toISO } from "@/lib/utils";
import { Breadcrumbs, type Crumb } from "@/components/blog/breadcrumbs";
import { PostBody } from "@/components/blog/post-body";
import { PostMeta } from "@/components/blog/post-meta";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { ShareButtons } from "@/components/blog/share-buttons";
import { BookmarkButton } from "@/components/blog/bookmark-button";
import { AuthorCard } from "@/components/blog/author-card";
import { RelatedArticles } from "@/components/blog/related-articles";
import { CategoryBadge } from "@/components/blog/category-badge";
import { TagList } from "@/components/blog/tag-list";
import { JsonLd } from "@/components/seo/json-ld";

export const revalidate = 600;

type Params = { params: { slug: string } };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = await getPublishedPostBySlug(params.slug);
  if (!post) {
    return buildMetadata({ title: "Article not found", noIndex: true, path: `/blog/${params.slug}` });
  }
  return buildMetadata({
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.ogImage || post.coverImage || undefined,
    type: "article",
    publishedTime: post.publishedAt ? toISO(post.publishedAt) : undefined,
    modifiedTime: toISO(post.updatedAt),
    authors: [post.author.name],
    tags: post.tags.map((t) => t.name),
  });
}

export default async function ArticlePage({ params }: Params) {
  const post = await getPublishedPostBySlug(params.slug);
  if (!post) notFound();

  await incrementViews(post.id);

  const safeHtml = addHeadingIds(sanitize(post.content));
  const toc = extractToc(safeHtml);
  const related = await getRelatedPosts({
    postId: post.id,
    categorySlug: post.category?.slug,
    tagSlugs: post.tags.map((t) => t.slug),
  });

  const url = absoluteUrl(`/blog/${post.slug}`);
  const crumbs: Crumb[] = [
    { name: "Home", href: "/" },
    { name: "Blog", href: "/blog" },
    ...(post.category ? [{ name: post.category.name, href: `/category/${post.category.slug}` }] : []),
    { name: post.title },
  ];

  return (
    <>
      <ReadingProgress />
      <JsonLd
        data={jsonLdArticle({
          title: post.title,
          description: post.metaDescription || post.excerpt,
          slug: post.slug,
          image: post.ogImage || post.coverImage,
          publishedAt: post.publishedAt ? toISO(post.publishedAt) : null,
          updatedAt: toISO(post.updatedAt),
          authorName: post.author.name,
          authorUrl: absoluteUrl(`/author/${post.author.id}`),
          tags: post.tags.map((t) => t.name),
        })}
      />
      <JsonLd data={jsonLdBreadcrumb(crumbs.map((c) => ({ name: c.name, url: c.href || url })))} />

      <article className="container py-8 md:py-12">
        <Breadcrumbs items={crumbs} className="mb-8" />

        <header className="mx-auto max-w-3xl">
          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {post.category && <CategoryBadge category={post.category} />}
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" />
              {post.readingTime} min read
            </span>
            {post.views > 0 && (
              <span className="inline-flex items-center gap-1">
                <Eye className="size-3.5" />
                {post.views.toLocaleString()} views
              </span>
            )}
          </div>

          <h1 className="font-heading text-3xl font-bold leading-tight text-balance md:text-4xl lg:text-[2.7rem]">
            {post.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
            <PostMeta author={post.author} date={post.publishedAt} />
            <div className="flex items-center gap-2">
              <ShareButtons url={url} title={post.title} className="hidden sm:flex" />
              <BookmarkButton slug={post.slug} title={post.title} withLabel />
            </div>
          </div>
        </header>

        {post.coverImage && (
          <div className="mx-auto my-8 max-w-4xl">
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border">
              <Image
                src={post.coverImage}
                alt={post.coverImageAlt || post.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover"
              />
            </div>
          </div>
        )}

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-14">
          <div className="mx-auto w-full min-w-0 max-w-3xl lg:mx-0">
            <PostBody html={safeHtml} />

            {post.tags.length > 0 && (
              <div className="mt-10">
                <TagList tags={post.tags} />
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
              <ShareButtons url={url} title={post.title} />
              <BookmarkButton slug={post.slug} title={post.title} withLabel />
            </div>

            <div className="mt-10">
              <AuthorCard author={post.author} />
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <TableOfContents items={toc} />
            </div>
          </aside>
        </div>
      </article>

      <RelatedArticles posts={related} />
    </>
  );
}
