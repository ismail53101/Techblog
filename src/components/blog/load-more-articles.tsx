"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import type { PostCard as PostCardData } from "@/lib/posts";
import { PostCard } from "./post-card";
import { ArticleCardSkeleton } from "./article-card-skeleton";

/**
 * Progressively loads more published articles from /api/articles.
 * Server renders page 1; this continues from page 2 with a "Load more"
 * button and automatic infinite-scroll when the sentinel is near the viewport.
 */
export function LoadMoreArticles({
  initialPage = 1,
  totalPages,
  perPage = 6,
}: {
  initialPage?: number;
  totalPages: number;
  perPage?: number;
}) {
  const [posts, setPosts] = React.useState<PostCardData[]>([]);
  const [page, setPage] = React.useState(initialPage);
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(initialPage >= totalPages);
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  const loadMore = React.useCallback(async () => {
    if (loading || done) return;
    setLoading(true);
    try {
      const next = page + 1;
      const res = await fetch(`/api/articles?page=${next}&perPage=${perPage}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.posts) && data.posts.length) {
        setPosts((prev) => [...prev, ...data.posts]);
        setPage(next);
        if (!data.hasMore) setDone(true);
      } else {
        setDone(true);
      }
    } catch {
      /* leave the button so the user can retry */
    } finally {
      setLoading(false);
    }
  }, [loading, done, page, perPage]);

  React.useEffect(() => {
    const el = sentinelRef.current;
    if (!el || done || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "400px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore, done]);

  return (
    <>
      {posts.length > 0 && (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}

      {loading && (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
          {Array.from({ length: 3 }).map((_, i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      )}

      <div ref={sentinelRef} aria-hidden className="h-px" />

      {!done && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-accent disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Loading…
              </>
            ) : (
              "Load more articles"
            )}
          </button>
        </div>
      )}
    </>
  );
}
