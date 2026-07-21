import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { postSchema } from "@/lib/validations";
import { sanitize } from "@/lib/sanitize";
import { readingTime } from "@/lib/reading-time";
import { slugify } from "@/lib/slugify";
import { requireAuth, badRequest, conflict, ok, serverError } from "@/lib/api";
import { resolvePublish, revalidateBlog, uniquePostSlug } from "@/lib/post-mutations";

export const runtime = "nodejs";

const PER_PAGE = 20;

export async function GET(request: Request) {
  const { user, response } = await requireAuth(["ADMIN", "EDITOR", "AUTHOR"]);
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const status = searchParams.get("status");
  const q = (searchParams.get("q") || "").trim();

  const where: Prisma.PostWhereInput = {};
  if (status && ["DRAFT", "SCHEDULED", "PUBLISHED"].includes(status)) {
    where.status = status as Prisma.PostWhereInput["status"];
  }
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
    ];
  }
  // Authors only see their own posts.
  if (user.role === "AUTHOR") where.authorId = user.id;

  try {
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * PER_PAGE,
        take: PER_PAGE,
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          featured: true,
          views: true,
          publishedAt: true,
          updatedAt: true,
          category: { select: { name: true, slug: true } },
          author: { select: { name: true } },
        },
      }),
      prisma.post.count({ where }),
    ]);
    return ok({ posts, total, page, totalPages: Math.max(1, Math.ceil(total / PER_PAGE)) });
  } catch {
    return serverError("Could not load posts");
  }
}

export async function POST(request: Request) {
  const { user, response } = await requireAuth(["ADMIN", "EDITOR", "AUTHOR"]);
  if (response) return response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid request body");
  }

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());
  const d = parsed.data;

  const slug = await uniquePostSlug(d.slug || d.title);
  const content = sanitize(d.content);
  const { status, publishedAt } = resolvePublish(d.status, d.publishedAt ?? null);

  try {
    const post = await prisma.post.create({
      data: {
        title: d.title,
        slug,
        excerpt: d.excerpt,
        content,
        readingTime: readingTime(content),
        coverImage: d.coverImage || null,
        coverImageAlt: d.coverImageAlt || null,
        status,
        publishedAt,
        featured: d.featured,
        metaTitle: d.metaTitle || null,
        metaDescription: d.metaDescription || null,
        author: { connect: { id: user.id } },
        category: { connect: { id: d.categoryId } },
        tags: {
          connectOrCreate: d.tags.map((t) => ({
            where: { slug: slugify(t) },
            create: { name: t, slug: slugify(t) },
          })),
        },
      },
      select: { id: true, slug: true },
    });
    revalidateBlog(post.slug);
    return ok(post, 201);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") return conflict("A post with this slug already exists");
      if (e.code === "P2003" || e.code === "P2025") return badRequest("Selected category does not exist");
    }
    return serverError("Could not create post");
  }
}
