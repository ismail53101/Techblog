import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import type { PostCard as PostCardData } from "@/lib/posts";
import { CategoryBadge } from "./category-badge";
import { formatDate, toISO } from "@/lib/utils";
import { cn } from "@/lib/utils";

const FALLBACK_IMG = "https://picsum.photos/seed/techblog/1200/630";

export function PostCard({
  post,
  variant = "default",
  priority = false,
  className,
}: {
  post: PostCardData;
  variant?: "default" | "horizontal" | "compact";
  priority?: boolean;
  className?: string;
}) {
  const href = `/blog/${post.slug}`;
  const img = post.coverImage || FALLBACK_IMG;

  if (variant === "compact") {
    return (
      <article className={cn("group flex items-center gap-3", className)}>
        <Link href={href} className="relative aspect-square size-16 shrink-0 overflow-hidden rounded-lg">
          <Image src={img} alt={post.coverImageAlt || post.title} fill sizes="64px" className="object-cover transition-transform duration-300 group-hover:scale-105" />
        </Link>
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug">
            <Link href={href} className="hover:text-primary">{post.title}</Link>
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">{post.readingTime} min read</p>
        </div>
      </article>
    );
  }

  const horizontal = variant === "horizontal";

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-lg",
        horizontal && "sm:flex-row",
        className
      )}
    >
      <Link
        href={href}
        className={cn(
          "relative block aspect-[16/9] overflow-hidden",
          horizontal && "sm:aspect-auto sm:w-2/5"
        )}
      >
        <Image
          src={img}
          alt={post.coverImageAlt || post.title}
          fill
          sizes={horizontal ? "(max-width: 640px) 100vw, 40vw" : "(max-width: 768px) 100vw, 33vw"}
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center gap-2">
          {post.category && <CategoryBadge category={post.category} />}
        </div>
        <h3 className="font-heading text-lg font-semibold leading-snug text-balance">
          <Link href={href} className="transition-colors group-hover:text-primary">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>

        <div className="mt-4 flex items-center gap-3 pt-2 text-xs text-muted-foreground">
          <span>{post.author.name}</span>
          {post.publishedAt && (
            <>
              <span aria-hidden>·</span>
              <time dateTime={toISO(post.publishedAt)}>{formatDate(post.publishedAt)}</time>
            </>
          )}
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" />
            {post.readingTime} min
          </span>
        </div>
      </div>
    </article>
  );
}
