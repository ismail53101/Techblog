import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { POSTS_PER_PAGE, RELATED_POSTS_COUNT, SEARCH_RESULTS_LIMIT } from "@/lib/constants";

/** WHERE clause matching only live (published and not future-dated) posts. */
export function publishedWhere(): Prisma.PostWhereInput {
  return { status: "PUBLISHED", publishedAt: { lte: new Date() } };
}

export const postCardSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  coverImage: true,
  coverImageAlt: true,
  readingTime: true,
  views: true,
  publishedAt: true,
  featured: true,
  category: { select: { name: true, slug: true } },
  author: { select: { id: true, name: true, avatarUrl: true } },
} satisfies Prisma.PostSelect;

export type PostCard = Prisma.PostGetPayload<{ select: typeof postCardSelect }>;

export const postDetailSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  content: true,
  coverImage: true,
  coverImageAlt: true,
  readingTime: true,
  views: true,
  publishedAt: true,
  updatedAt: true,
  status: true,
  featured: true,
  metaTitle: true,
  metaDescription: true,
  ogImage: true,
  category: { select: { name: true, slug: true } },
  author: {
    select: {
      id: true,
      name: true,
      bio: true,
      avatarUrl: true,
      twitter: true,
      github: true,
      website: true,
    },
  },
  tags: { select: { name: true, slug: true } },
} satisfies Prisma.PostSelect;

export type PostDetail = Prisma.PostGetPayload<{ select: typeof postDetailSelect }>;

export type PostListResult = {
  posts: PostCard[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

type ListOptions = {
  page?: number;
  perPage?: number;
  categorySlug?: string;
  tagSlug?: string;
  authorId?: string;
  featured?: boolean;
  query?: string;
};

export async function getPublishedPosts(opts: ListOptions = {}): Promise<PostListResult> {
  const page = Math.max(1, opts.page ?? 1);
  const perPage = opts.perPage ?? POSTS_PER_PAGE;

  const where: Prisma.PostWhereInput = { ...publishedWhere() };
  const and: Prisma.PostWhereInput[] = [];

  if (opts.categorySlug) and.push({ category: { slug: opts.categorySlug } });
  if (opts.tagSlug) and.push({ tags: { some: { slug: opts.tagSlug } } });
  if (opts.authorId) and.push({ authorId: opts.authorId });
  if (opts.featured !== undefined) and.push({ featured: opts.featured });
  if (opts.query) {
    const q = opts.query.trim();
    if (q) {
      and.push({
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { excerpt: { contains: q, mode: "insensitive" } },
          { tags: { some: { name: { contains: q, mode: "insensitive" } } } },
          { category: { name: { contains: q, mode: "insensitive" } } },
        ],
      });
    }
  }
  if (and.length) where.AND = and;

  try {
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        select: postCardSelect,
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.post.count({ where }),
    ]);
    return { posts, total, page, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
  } catch {
    return { posts: [], total: 0, page, perPage, totalPages: 1 };
  }
}

export async function getPublishedPostBySlug(slug: string): Promise<PostDetail | null> {
  return prisma.post.findFirst({ where: { slug, ...publishedWhere() }, select: postDetailSelect });
}

export async function getRelatedPosts(opts: {
  postId: string;
  categorySlug?: string;
  tagSlugs?: string[];
  limit?: number;
}): Promise<PostCard[]> {
  const limit = opts.limit ?? RELATED_POSTS_COUNT;
  const or: Prisma.PostWhereInput[] = [];
  if (opts.categorySlug) or.push({ category: { slug: opts.categorySlug } });
  if (opts.tagSlugs?.length) or.push({ tags: { some: { slug: { in: opts.tagSlugs } } } });

  try {
    const primary = or.length
      ? await prisma.post.findMany({
          where: { ...publishedWhere(), id: { not: opts.postId }, OR: or },
          select: postCardSelect,
          orderBy: { publishedAt: "desc" },
          take: limit,
        })
      : [];

    if (primary.length >= limit) return primary;

    const backfill = await prisma.post.findMany({
      where: { ...publishedWhere(), id: { notIn: [opts.postId, ...primary.map((p) => p.id)] } },
      select: postCardSelect,
      orderBy: { publishedAt: "desc" },
      take: limit - primary.length,
    });
    return [...primary, ...backfill];
  } catch {
    return [];
  }
}

export async function getLatestPosts(limit = 5): Promise<PostCard[]> {
  try {
    return await prisma.post.findMany({
      where: publishedWhere(),
      select: postCardSelect,
      orderBy: { publishedAt: "desc" },
      take: limit,
    });
  } catch {
    return [];
  }
}

export async function getFeaturedPosts(limit = 4): Promise<PostCard[]> {
  try {
    return await prisma.post.findMany({
      where: { ...publishedWhere(), featured: true },
      select: postCardSelect,
      orderBy: { publishedAt: "desc" },
      take: limit,
    });
  } catch {
    return [];
  }
}

export async function getPopularPosts(limit = 5): Promise<PostCard[]> {
  try {
    return await prisma.post.findMany({
      where: publishedWhere(),
      select: postCardSelect,
      orderBy: [{ views: "desc" }, { publishedAt: "desc" }],
      take: limit,
    });
  } catch {
    return [];
  }
}

export async function getTrendingPosts(limit = 5): Promise<PostCard[]> {
  const since = new Date();
  since.setDate(since.getDate() - 30);
  try {
    const recent = await prisma.post.findMany({
      where: { status: "PUBLISHED", publishedAt: { gte: since, lte: new Date() } },
      select: postCardSelect,
      orderBy: [{ views: "desc" }, { publishedAt: "desc" }],
      take: limit,
    });
    if (recent.length >= limit) return recent;
    const extra = await prisma.post.findMany({
      where: { ...publishedWhere(), id: { notIn: recent.map((p) => p.id) } },
      select: postCardSelect,
      orderBy: [{ views: "desc" }],
      take: limit - recent.length,
    });
    return [...recent, ...extra];
  } catch {
    return [];
  }
}

export async function searchPosts(
  query: string,
  opts: { limit?: number; categorySlug?: string; tagSlug?: string } = {}
): Promise<PostCard[]> {
  const q = (query || "").trim();
  if (!q && !opts.categorySlug && !opts.tagSlug) return [];

  const where: Prisma.PostWhereInput = { ...publishedWhere() };
  const and: Prisma.PostWhereInput[] = [];
  if (q) {
    and.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { excerpt: { contains: q, mode: "insensitive" } },
        { tags: { some: { name: { contains: q, mode: "insensitive" } } } },
        { category: { name: { contains: q, mode: "insensitive" } } },
      ],
    });
  }
  if (opts.categorySlug) and.push({ category: { slug: opts.categorySlug } });
  if (opts.tagSlug) and.push({ tags: { some: { slug: opts.tagSlug } } });
  if (and.length) where.AND = and;

  try {
    return await prisma.post.findMany({
      where,
      select: postCardSelect,
      orderBy: [{ publishedAt: "desc" }],
      take: opts.limit ?? SEARCH_RESULTS_LIMIT,
    });
  } catch {
    return [];
  }
}

/** Best-effort view counter increment. Never throws. */
export async function incrementViews(id: string): Promise<void> {
  try {
    await prisma.post.update({ where: { id }, data: { views: { increment: 1 } } });
  } catch {
    /* ignore */
  }
}

export async function getAllPublishedPostRefs(): Promise<{ slug: string; updatedAt: Date }[]> {
  try {
    return await prisma.post.findMany({
      where: publishedWhere(),
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    return [];
  }
}

export async function getAllCategories() {
  try {
    return await prisma.category.findMany({ orderBy: { name: "asc" } });
  } catch {
    return [];
  }
}

export type CategoryWithCount = Prisma.CategoryGetPayload<object> & { count: number };

export async function getCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  try {
    const [categories, groups] = await Promise.all([
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      prisma.post.groupBy({ by: ["categoryId"], where: publishedWhere(), _count: { _all: true } }),
    ]);
    const counts = new Map(groups.map((g) => [g.categoryId, g._count._all]));
    return categories.map((c) => ({ ...c, count: counts.get(c.id) ?? 0 }));
  } catch {
    return [];
  }
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export async function getTagBySlug(slug: string) {
  return prisma.tag.findUnique({ where: { slug } });
}

export async function getAllTagsWithCounts(): Promise<
  { id: string; name: string; slug: string; count: number }[]
> {
  try {
    const tags = await prisma.tag.findMany({
      select: { id: true, name: true, slug: true, _count: { select: { posts: true } } },
      orderBy: { name: "asc" },
    });
    return tags.map((t) => ({ id: t.id, name: t.name, slug: t.slug, count: t._count.posts }));
  } catch {
    return [];
  }
}

export async function getAuthorById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      bio: true,
      avatarUrl: true,
      twitter: true,
      github: true,
      website: true,
    },
  });
}

/** Most recently *updated* published posts (for the "Recently updated" rail). */
export async function getRecentlyUpdatedPosts(limit = 4): Promise<PostCard[]> {
  try {
    return await prisma.post.findMany({
      where: publishedWhere(),
      select: postCardSelect,
      orderBy: { updatedAt: "desc" },
      take: limit,
    });
  } catch {
    return [];
  }
}

/** Latest published posts within a single category (by slug). */
export async function getPostsByCategory(slug: string, limit = 3): Promise<PostCard[]> {
  try {
    return await prisma.post.findMany({
      where: { ...publishedWhere(), category: { slug } },
      select: postCardSelect,
      orderBy: { publishedAt: "desc" },
      take: limit,
    });
  } catch {
    return [];
  }
}

export type AdjacentPost = { title: string; slug: string; coverImage: string | null };
export type AdjacentPosts = { prev: AdjacentPost | null; next: AdjacentPost | null };

/** The previous (older) and next (newer) published posts relative to one post. */
export async function getAdjacentPosts(opts: {
  id: string;
  publishedAt: Date | null;
}): Promise<AdjacentPosts> {
  const pub = opts.publishedAt ?? new Date();
  const select = { title: true, slug: true, coverImage: true } satisfies Prisma.PostSelect;
  try {
    const [prev, next] = await Promise.all([
      prisma.post.findFirst({
        where: { ...publishedWhere(), id: { not: opts.id }, publishedAt: { lt: pub } },
        orderBy: { publishedAt: "desc" },
        select,
      }),
      prisma.post.findFirst({
        where: { ...publishedWhere(), id: { not: opts.id }, publishedAt: { gt: pub } },
        orderBy: { publishedAt: "asc" },
        select,
      }),
    ]);
    return { prev, next };
  } catch {
    return { prev: null, next: null };
  }
}

export type FeaturedCategory = { category: CategoryWithCount; post: PostCard | null };

export type HomeData = {
  featured: PostCard[];
  latest: PostCard[];
  latestTotalPages: number;
  trending: PostCard[];
  popular: PostCard[];
  categories: CategoryWithCount[];
  recentlyUpdated: PostCard[];
  reviews: PostCard[];
  howto: PostCard[];
  aiTools: PostCard[];
  productivity: PostCard[];
  featuredCategories: FeaturedCategory[];
};

/** One parallel fetch powering the whole homepage. */
export async function getHomeData(): Promise<HomeData> {
  const [featured, latestRes, trending, popular, categories, recentlyUpdated, reviews, howto, aiTools, productivity] =
    await Promise.all([
      getFeaturedPosts(6),
      getPublishedPosts({ perPage: 6 }),
      getTrendingPosts(5),
      getPopularPosts(5),
      getCategoriesWithCounts(),
      getRecentlyUpdatedPosts(4),
      getPostsByCategory("reviews", 3),
      getPostsByCategory("how-to-guides", 3),
      getPostsByCategory("ai-tools", 3),
      getPostsByCategory("productivity", 4),
    ]);

  const topCats = categories
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  const featuredCategories: FeaturedCategory[] = await Promise.all(
    topCats.map(async (category) => ({ category, post: (await getPostsByCategory(category.slug, 1))[0] ?? null }))
  );

  return {
    featured,
    latest: latestRes.posts,
    latestTotalPages: latestRes.totalPages,
    trending,
    popular,
    categories,
    recentlyUpdated,
    reviews,
    howto,
    aiTools,
    productivity,
    featuredCategories,
  };
}
