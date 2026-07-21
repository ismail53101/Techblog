import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Eye,
  Flame,
  History,
  Layers,
  LayoutGrid,
  Mail,
  Newspaper,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { getHomeData } from "@/lib/posts";
import { sortByCategoryOrder } from "@/lib/category-icons";
import { siteConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { HeroSlider } from "@/components/blog/hero-slider";
import { SectionHeading } from "@/components/blog/section-heading";
import { PostGrid } from "@/components/blog/post-grid";
import { PostList } from "@/components/blog/post-list";
import { PostCard } from "@/components/blog/post-card";
import { CategoryCard } from "@/components/blog/category-card";
import { FeaturedCategoryCard } from "@/components/blog/featured-category-card";
import { LoadMoreArticles } from "@/components/blog/load-more-articles";
import { Reveal } from "@/components/blog/reveal";
import { NewsletterForm } from "@/components/blog/newsletter-form";
import { EmptyState } from "@/components/blog/empty-state";

// Render from the live database (Railway's build can't reach the private DB).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getHomeData();
  const heroPosts = data.featured.length >= 2 ? data.featured : data.latest;
  const hasContent = heroPosts.length > 0 || data.latest.length > 0;
  const orderedCategories = sortByCategoryOrder(data.categories);

  const themed = [
    { key: "reviews", title: "Reviews", eyebrow: "Honest verdicts", Icon: Star, href: "/category/reviews", posts: data.reviews },
    { key: "howto", title: "How-To Guides", eyebrow: "Step by step", Icon: BookOpen, href: "/category/how-to-guides", posts: data.howto },
    { key: "ai", title: "AI Tools", eyebrow: "Work smarter", Icon: Sparkles, href: "/category/ai-tools", posts: data.aiTools },
    { key: "prod", title: "Productivity", eyebrow: "Do more with less", Icon: Zap, href: "/category/productivity", posts: data.productivity },
  ].filter((s) => s.posts.length > 0);

  if (!hasContent) {
    return (
      <div className="container py-24">
        <EmptyState
          title="No articles published yet"
          description="Once you publish your first article from the admin dashboard, it will appear here."
        />
      </div>
    );
  }

  return (
    <>
      <h1 className="sr-only">
        {siteConfig.name} — {siteConfig.tagline}
      </h1>

      {/* 1 · Hero slider */}
      <HeroSlider posts={heroPosts} />

      {/* 2 · Latest articles */}
      {data.latest.length > 0 && (
        <Reveal>
          <section className="container py-12 md:py-16" aria-labelledby="latest-heading">
            <SectionHeading title="Latest articles" eyebrow="Fresh off the press" Icon={Newspaper} href="/blog" />
            <div id="latest-heading" className="sr-only">
              Latest articles
            </div>
            <PostGrid posts={data.latest} />
          </section>
        </Reveal>
      )}

      {/* 3 · Trending */}
      {data.trending.length > 0 && (
        <Reveal>
          <section className="container pb-12 md:pb-16" aria-label="Trending articles">
            <SectionHeading title="Trending now" eyebrow="What everyone's reading" Icon={Flame} href="/blog" />
            <PostGrid posts={data.trending.slice(0, 3)} />
          </section>
        </Reveal>
      )}

      {/* 4 · Most popular */}
      {data.popular.length > 0 && (
        <section className="border-y border-border bg-muted/30">
          <Reveal>
            <div className="container py-12 md:py-16">
              <SectionHeading title="Most popular" eyebrow="All-time favourites" Icon={Eye} />
              <div className="grid gap-6 lg:grid-cols-2">
                <PostCard post={data.popular[0]} />
                <div className="rounded-2xl border border-border bg-card p-6 sm:p-7">
                  <PostList title="Also popular" posts={data.popular.slice(1, 5)} ranked />
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* 5 · Browse by category */}
      {orderedCategories.length > 0 && (
        <Reveal>
          <section className="container py-12 md:py-16" aria-label="Browse by category">
            <SectionHeading title="Browse by category" eyebrow="Find your topic" Icon={LayoutGrid} href="/category" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {orderedCategories.map((c) => (
                <CategoryCard key={c.id} category={c} />
              ))}
            </div>
          </section>
        </Reveal>
      )}

      {/* 6 · Featured categories (each with its latest article) */}
      {data.featuredCategories.length > 0 && (
        <section className="border-y border-border bg-muted/30">
          <Reveal>
            <div className="container py-12 md:py-16">
              <SectionHeading title="Featured categories" eyebrow="Editor's picks by topic" Icon={Layers} />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {data.featuredCategories.map((item) => (
                  <FeaturedCategoryCard key={item.category.id} item={item} />
                ))}
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* 7 · Recently updated */}
      {data.recentlyUpdated.length > 0 && (
        <Reveal>
          <section className="container py-12 md:py-16" aria-label="Recently updated">
            <SectionHeading title="Recently updated" eyebrow="Kept current" Icon={History} href="/blog" />
            <PostGrid posts={data.recentlyUpdated} className="lg:grid-cols-4" />
          </section>
        </Reveal>
      )}

      {/* 8–11 · Themed category rails */}
      {themed.map((s, i) => (
        <section
          key={s.key}
          aria-label={s.title}
          className={cn(i % 2 === 1 && "border-y border-border bg-muted/30")}
        >
          <Reveal>
            <div className="container py-12 md:py-16">
              <SectionHeading title={s.title} eyebrow={s.eyebrow} Icon={s.Icon} href={s.href} />
              <PostGrid posts={s.posts.slice(0, 3)} />
            </div>
          </Reveal>
        </section>
      ))}

      {/* More articles — infinite scroll / load more */}
      {data.latestTotalPages > 1 && (
        <Reveal>
          <section className="container py-12 md:py-16" aria-label="More articles">
            <SectionHeading title="More articles" eyebrow="Keep exploring" Icon={Newspaper} />
            <LoadMoreArticles initialPage={1} totalPages={data.latestTotalPages} perPage={6} />
          </section>
        </Reveal>
      )}

      {/* 12 · Newsletter */}
      <section className="border-t border-border bg-gradient-to-b from-muted/40 to-background">
        <Reveal>
          <div className="container py-16 md:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Mail className="size-6" />
              </span>
              <h2 className="mt-4 font-heading text-2xl font-bold tracking-tight md:text-3xl">
                Get the weekly FixPedia digest
              </h2>
              <p className="mt-3 text-muted-foreground">
                The best new guides, reviews, and fixes across {data.categories.length || 15}+ topics — straight to
                your inbox. No spam, unsubscribe anytime.
              </p>
              <NewsletterForm className="mx-auto mt-6 max-w-md" />
              <div className="mt-6">
                <Link href="/blog" className={cn(buttonVariants({ variant: "outline" }), "gap-1")}>
                  Or browse all articles
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
