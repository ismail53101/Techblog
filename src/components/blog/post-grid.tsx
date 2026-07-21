import type { PostCard as PostCardData } from "@/lib/posts";
import { PostCard } from "./post-card";
import { cn } from "@/lib/utils";

export function PostGrid({
  posts,
  className,
  priorityCount = 0,
}: {
  posts: PostCardData[];
  className?: string;
  priorityCount?: number;
}) {
  return (
    <div className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {posts.map((post, i) => (
        <PostCard key={post.id} post={post} priority={i < priorityCount} />
      ))}
    </div>
  );
}
