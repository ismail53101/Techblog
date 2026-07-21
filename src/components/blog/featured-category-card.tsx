import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { getCategoryIcon } from "@/lib/category-icons";
import type { FeaturedCategory } from "@/lib/posts";

const FALLBACK_IMG = "https://picsum.photos/seed/fixpedia-cat/1200/630";

export function FeaturedCategoryCard({ item }: { item: FeaturedCategory }) {
  const { category, post } = item;
  const Icon = getCategoryIcon(category.slug);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:border-primary/30 hover:shadow-lg">
      {post && (
        <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/9] overflow-hidden">
          <Image
            src={post.coverImage || FALLBACK_IMG}
            alt={post.coverImageAlt || post.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold backdrop-blur">
            <Icon className="size-3.5 text-primary" />
            {category.name}
          </span>
        </Link>
      )}

      <div className="flex flex-1 flex-col p-5">
        {!post && (
          <span className="mb-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
            <Icon className="size-3.5" />
            {category.name}
          </span>
        )}

        {post ? (
          <>
            <h3 className="font-heading text-lg font-semibold leading-snug text-balance">
              <Link href={`/blog/${post.slug}`} className="transition-colors hover:text-primary">
                {post.title}
              </Link>
            </h3>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
            <p className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              {post.readingTime} min read
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Fresh articles coming soon.</p>
        )}

        <Link
          href={`/category/${category.slug}`}
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Explore {category.name}
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
