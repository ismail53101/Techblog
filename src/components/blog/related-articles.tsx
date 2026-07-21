import type { PostCard as PostCardData } from "@/lib/posts";
import { PostCard } from "./post-card";

export function RelatedArticles({ posts }: { posts: PostCardData[] }) {
  if (!posts.length) return null;
  return (
    <section aria-labelledby="related-heading" className="border-t border-border py-12">
      <div className="container">
        <h2 id="related-heading" className="mb-6 font-heading text-2xl font-bold">
          Related articles
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
