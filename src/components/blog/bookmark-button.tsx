"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { cn } from "@/lib/utils";

export function BookmarkButton({
  slug,
  title,
  withLabel = false,
  className,
}: {
  slug: string;
  title: string;
  withLabel?: boolean;
  className?: string;
}) {
  const { isBookmarked, toggle, hydrated } = useBookmarks();
  const active = hydrated && isBookmarked(slug);

  function onClick() {
    const added = toggle({ slug, title });
    toast[added ? "success" : "message"](added ? "Saved to bookmarks" : "Removed from bookmarks");
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? "Remove bookmark" : "Bookmark this article"}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "border-primary/40 bg-accent text-accent-foreground"
          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
        className
      )}
    >
      {active ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
      {withLabel && <span>{active ? "Saved" : "Save"}</span>}
    </button>
  );
}
