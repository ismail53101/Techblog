import { searchPosts } from "@/lib/posts";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { ok, tooManyRequests } from "@/lib/api";

export async function GET(request: Request) {
  const ip = getClientIp(request.headers);
  const limited = rateLimit(`search:${ip}`, 40, 60_000);
  if (!limited.success) return tooManyRequests();

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const limit = Math.min(20, Math.max(1, Number(searchParams.get("limit")) || 8));
  const category = searchParams.get("category") || undefined;
  const tag = searchParams.get("tag") || undefined;

  const posts = await searchPosts(q, { limit, categorySlug: category, tagSlug: tag });

  const results = posts.map((p) => ({
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    readingTime: p.readingTime,
    category: p.category,
  }));

  return ok({ results });
}
