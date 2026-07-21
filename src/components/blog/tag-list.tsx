import Link from "next/link";
import { Hash } from "lucide-react";
import { cn } from "@/lib/utils";

export function TagList({
  tags,
  className,
}: {
  tags: { name: string; slug: string }[];
  className?: string;
}) {
  if (!tags.length) return null;
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {tags.map((tag) => (
        <Link
          key={tag.slug}
          href={`/tag/${tag.slug}`}
          className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          <Hash className="size-3" />
          {tag.name}
        </Link>
      ))}
    </div>
  );
}
