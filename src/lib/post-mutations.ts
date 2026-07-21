import { revalidatePath } from "next/cache";
import type { PostStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

/** Find a unique post slug, appending -2, -3, ... as needed. */
export async function uniquePostSlug(desired: string, excludeId?: string): Promise<string> {
  const base = slugify(desired) || "post";
  let slug = base;
  let n = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.post.findFirst({
      where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true },
    });
    if (!existing) return slug;
    slug = `${base}-${n++}`;
  }
}

/**
 * Normalize the status/publishedAt pair:
 *  - PUBLISHED with no date  -> published now
 *  - SCHEDULED in the past   -> published now
 *  - SCHEDULED in the future -> stays scheduled
 *  - DRAFT                   -> keeps any provided date (hidden regardless)
 */
export function resolvePublish(
  status: PostStatus,
  publishedAt?: Date | null
): { status: PostStatus; publishedAt: Date | null } {
  const now = new Date();
  if (status === "PUBLISHED") return { status, publishedAt: publishedAt ?? now };
  if (status === "SCHEDULED") {
    if (!publishedAt || publishedAt <= now) return { status: "PUBLISHED", publishedAt: publishedAt ?? now };
    return { status, publishedAt };
  }
  return { status: "DRAFT", publishedAt: publishedAt ?? null };
}

/** Revalidate the pages affected by a post change so ISR caches refresh. */
export function revalidateBlog(slug?: string, categorySlug?: string) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/category");
  if (slug) revalidatePath(`/blog/${slug}`);
  if (categorySlug) revalidatePath(`/category/${categorySlug}`);
}
