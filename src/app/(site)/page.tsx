import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  getCategoriesWithCounts,
  getFeaturedPosts,
  getPopularPosts,
  getPublishedPosts,
  getTrendingPosts,
} from "@/lib/posts";
import { FeaturedHero } from "@/components/blog/featured-hero";
import { PostGrid } from "@/components/blog/post-grid";
import { PostList } from "@/components/blog/post-list";
import { EmptyState } from "@/components/blog/empty-state";
import { NewsletterForm } from "@/components/blog/newsletter-form";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";

// Render from the live database (Railway's build can't reach the private DB, so
// static prerender would be empty until revalidation). Keeps the homepage current.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, latest, trending, popular, categories] = await Promise.all([
    getFeaturedPosts(5),
    getPublishedPosts({ perPage: 7 }),
    getTrendingPosts(5),
    getPopularPosts(5),
    getCategoriesWithCounts(),
  ]);

  const heroPosts = featured.length >= 2 ? featured : latest.posts.slice(0, 4);
  const heroIds = new Set(heroPosts.map((p) => p.id));
  const latestPosts = latest.posts.filter((p) => !heroIds.has(p.id)).slice(0, 6);
  const hasContent = heroPosts.length > 0 || latestPosts.length > 0;

  return (
    <>
      {heroPosts.length > 0 && <FeaturedHero posts={heroPosts} />}

      {categories.length > 0 && (
        <section className="container pt-10">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="rounded-full border border-border px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {c.name}
                <span className="ml-1.5 text-xs text-muted-foreground/60">{c.count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="container grid gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-14">
        <div className="min-w-0">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-heading text-2xl font-bold">Latest articles</h2>
            <Link href="/blog" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              View all <ArrowRight className="size-4" />
            </Link>
          </div>

          {latestPosts.length > 0 ? (
            <PostGrid posts={latestPosts} priorityCount={0} className="lg:grid-cols-2 xl:grid-cols-3" />
          ) : !hasContent ? (
            <EmptyState
              title="No articles published yet"
              description="Once you publish your first article from the admin dashboard, it will appear here."
            />
          ) : null}
        </div>

        <aside className="space-y-10">
          {trending.length > 0 && <PostList title="Trending now" posts={trending} ranked />}
          {popular.length > 0 && <PostList title="Most popular" posts={popular} />}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-heading font-semibold">Stay in the loop</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Weekly guides and reviews. No spam, unsubscribe anytime.
            </p>
            <NewsletterForm className="mt-4" />
          </div>
        </aside>
      </div>

      <section className="border-t border-border bg-muted/30">
        <div className="container flex flex-col items-center gap-4 py-16 text-center">
          <h2 className="max-w-2xl font-heading text-2xl font-bold text-balance md:text-3xl">
            {siteConfig.tagline}
          </h2>
          <p className="max-w-xl text-muted-foreground">
            Browse in-depth guides, honest reviews, and practical fixes across {categories.length || 10}+ topics.
          </p>
          <Link href="/blog" className={cn(buttonVariants({ size: "lg" }), "mt-2")}>
            Explore all articles
          </Link>
        </div>
      </section>
    </>
  );
}
