import { getPublishedPosts } from "@/lib/posts";
import { ok, serverError } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public, read-only list of published articles — powers the homepage/blog
 * "Load more" control. Supports ?page= and ?perPage= (and optional ?category=).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const perPage = Math.min(24, Math.max(1, Number(searchParams.get("perPage")) || 9));
  const categorySlug = searchParams.get("category") || undefined;

  try {
    const result = await getPublishedPosts({ page, perPage, categorySlug });
    return ok({
      posts: result.posts,
      page: result.page,
      totalPages: result.totalPages,
      hasMore: result.page < result.totalPages,
    });
  } catch {
    return serverError("Could not load articles");
  }
}
