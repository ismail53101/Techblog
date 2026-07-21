"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import type { PostCard } from "@/lib/posts";
import { cn, formatDate, toISO } from "@/lib/utils";

const FALLBACK_IMG = "https://picsum.photos/seed/fixpedia-hero/1600/900";

export function HeroSlider({ posts }: { posts: PostCard[] }) {
  const slides = posts.slice(0, 5);
  const n = slides.length;
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  const go = React.useCallback((d: number) => setIndex((p) => (p + d + n) % n), [n]);

  React.useEffect(() => {
    if (paused || n <= 1) return;
    const t = setInterval(() => setIndex((p) => (p + 1) % n), 6000);
    return () => clearInterval(t);
  }, [paused, n]);

  if (!n) return null;

  return (
    <section className="container pt-6 md:pt-8" aria-roledescription="carousel" aria-label="Featured articles">
      <div
        className="relative overflow-hidden rounded-3xl border border-border"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]">
          {slides.map((post, idx) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              aria-hidden={idx !== index}
              tabIndex={idx === index ? 0 : -1}
              className={cn(
                "group absolute inset-0 transition-opacity duration-700 ease-out",
                idx === index ? "opacity-100" : "pointer-events-none opacity-0"
              )}
            >
              <Image
                src={post.coverImage || FALLBACK_IMG}
                alt={post.coverImageAlt || post.title}
                fill
                priority={idx === 0}
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8 md:p-10 lg:p-14">
                <div className="max-w-3xl">
                  {post.category && (
                    <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      {post.category.name}
                    </span>
                  )}
                  <h2 className="mt-3 font-heading text-2xl font-bold leading-tight text-balance sm:text-3xl md:text-4xl lg:text-5xl">
                    {post.title}
                  </h2>
                  <p className="mt-3 hidden max-w-2xl text-white/80 sm:line-clamp-2 md:text-lg">{post.excerpt}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/75">
                    <span>{post.author.name}</span>
                    {post.publishedAt && (
                      <>
                        <span aria-hidden>·</span>
                        <time dateTime={toISO(post.publishedAt)}>{formatDate(post.publishedAt)}</time>
                      </>
                    )}
                    <span aria-hidden>·</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3.5" />
                      {post.readingTime} min read
                    </span>
                  </div>
                  <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition-all group-hover:gap-3">
                    Read article
                    <ArrowRight className="size-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {n > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous featured article"
              className="absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-black/40 p-2 text-white backdrop-blur transition-colors hover:bg-black/60 focus-visible:ring-2 focus-visible:ring-white sm:inline-flex"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next featured article"
              className="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-black/40 p-2 text-white backdrop-blur transition-colors hover:bg-black/60 focus-visible:ring-2 focus-visible:ring-white sm:inline-flex"
            >
              <ChevronRight className="size-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setIndex(idx)}
                  aria-label={`Go to featured article ${idx + 1}`}
                  aria-current={idx === index}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    idx === index ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
