import Image from "next/image";
import Link from "next/link";
import type { PostCard as PostCardData } from "@/lib/posts";
import { formatDate, toISO } from "@/lib/utils";

const FALLBACK_IMG = "https://picsum.photos/seed/techblog-hero/1200/800";

export function FeaturedHero({ posts }: { posts: PostCardData[] }) {
  if (!posts.length) return null;
  const lead = posts[0];
  const secondary = posts.slice(1, 4);

  return (
    <section className="container pt-8 md:pt-12">
      <div className="grid gap-6 lg:grid-cols-2">
        <Link
          href={`/blog/${lead.slug}`}
          className="group relative flex min-h-[24rem] flex-col justify-end overflow-hidden rounded-3xl border border-border p-6 md:min-h-[30rem] md:p-8"
        >
          <Image
            src={lead.coverImage || FALLBACK_IMG}
            alt={lead.coverImageAlt || lead.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
          <div className="relative text-white">
            {lead.category && (
              <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
                {lead.category.name}
              </span>
            )}
            <h2 className="mt-3 font-heading text-2xl font-bold leading-tight text-balance md:text-4xl">
              {lead.title}
            </h2>
            <p className="mt-2 line-clamp-2 max-w-xl text-white/80">{lead.excerpt}</p>
            <p className="mt-4 text-sm text-white/70">
              {lead.author.name}
              {lead.publishedAt && (
                <>
                  <span className="px-1.5">·</span>
                  <time dateTime={toISO(lead.publishedAt)}>{formatDate(lead.publishedAt)}</time>
                </>
              )}
            </p>
          </div>
        </Link>

        <div className="grid content-start gap-5">
          {secondary.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group grid grid-cols-[8rem_1fr] gap-4 overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/30 sm:grid-cols-[11rem_1fr]"
            >
              <div className="relative aspect-square sm:aspect-auto">
                <Image
                  src={post.coverImage || FALLBACK_IMG}
                  alt={post.coverImageAlt || post.title}
                  fill
                  sizes="176px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col justify-center py-3 pr-4">
                {post.category && (
                  <span className="mb-1 text-xs font-medium text-primary">{post.category.name}</span>
                )}
                <h3 className="line-clamp-2 font-heading font-semibold leading-snug transition-colors group-hover:text-primary">
                  {post.title}
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground">{post.readingTime} min read</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
