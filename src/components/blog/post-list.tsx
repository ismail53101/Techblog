import Link from "next/link";
import type { PostCard as PostCardData } from "@/lib/posts";
import { cn } from "@/lib/utils";

/** Compact, optionally-ranked list of posts — used in sidebars (popular/trending/latest). */
export function PostList({
  title,
  posts,
  ranked = false,
  className,
}: {
  title?: string;
  posts: PostCardData[];
  ranked?: boolean;
  className?: string;
}) {
  if (!posts.length) return null;
  return (
    <section className={className}>
      {title && (
        <h3 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
      )}
      <ol className="space-y-4">
        {posts.map((post, i) => (
          <li key={post.id} className="flex gap-3">
            {ranked && (
              <span className="font-heading text-lg font-bold text-primary/40 tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
            )}
            <div className="min-w-0">
              <h4 className="line-clamp-2 text-sm font-medium leading-snug">
                <Link href={`/blog/${post.slug}`} className="hover:text-primary">
                  {post.title}
                </Link>
              </h4>
              <p className="mt-1 text-xs text-muted-foreground">
                {post.category ? `${post.category.name} · ` : ""}
                {post.readingTime} min read
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
