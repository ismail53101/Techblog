import { prisma } from "@/lib/prisma";
import { requireAuth, ok, serverError } from "@/lib/api";
import { revalidateBlog } from "@/lib/post-mutations";
import { slugify } from "@/lib/slugify";
import { readingTime } from "@/lib/reading-time";
import { sanitize } from "@/lib/sanitize";
import { articles, contentCategories } from "@/lib/content";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Resolve the author for imported posts.
 * Normal path: an authenticated ADMIN session.
 * One-time bootstrap path: `Authorization: Bearer <IMPORT_TOKEN>` — only active
 * while the IMPORT_TOKEN env var is set (removed after the initial import).
 */
async function resolveAuthor(
  request: Request
): Promise<{ authorId: string } | { error: Response }> {
  const importToken = process.env.IMPORT_TOKEN;
  const auth = request.headers.get("authorization");
  if (importToken && auth === `Bearer ${importToken}`) {
    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    if (!admin) return { error: serverError("No admin user found to attribute posts to") };
    return { authorId: admin.id };
  }
  const { user, response } = await requireAuth(["ADMIN"]);
  if (response) return { error: response };
  return { authorId: user.id };
}

export async function POST(request: Request) {
  const authResult = await resolveAuthor(request);
  if ("error" in authResult) return authResult.error;
  const authorId = authResult.authorId;

  let body: { reset?: boolean } = {};
  try {
    body = await request.json();
  } catch {
    /* default */
  }
  const reset = body?.reset !== false;

  try {
    const categoryIdByName: Record<string, string> = {};
    for (const c of contentCategories) {
      const cat = await prisma.category.upsert({
        where: { slug: c.slug },
        update: { name: c.name, description: c.description },
        create: c,
      });
      categoryIdByName[c.name] = cat.id;
    }

    if (reset) {
      await prisma.post.deleteMany({});
      await prisma.tag.deleteMany({});
      await prisma.category.deleteMany({
        where: { slug: { notIn: contentCategories.map((c) => c.slug) } },
      });
    }

    const now = Date.now();
    let imported = 0;
    for (let i = 0; i < articles.length; i++) {
      const a = articles[i];
      const categoryId = categoryIdByName[a.category];
      if (!categoryId) continue;
      const content = sanitize(a.content);
      await prisma.post.upsert({
        where: { slug: a.slug },
        update: {},
        create: {
          title: a.title,
          slug: a.slug,
          excerpt: a.excerpt,
          content,
          coverImage: `https://picsum.photos/seed/${a.slug}/1200/630`,
          coverImageAlt: a.title,
          status: "PUBLISHED",
          featured: i < 4,
          readingTime: readingTime(content),
          views: 0,
          metaTitle: a.metaTitle || a.title,
          metaDescription: a.metaDescription || a.excerpt,
          publishedAt: new Date(now - i * 36 * 3600 * 1000),
          author: { connect: { id: authorId } },
          category: { connect: { id: categoryId } },
          tags: {
            connectOrCreate: a.tags.map((t) => ({
              where: { slug: slugify(t) },
              create: { name: t, slug: slugify(t) },
            })),
          },
        },
      });
      imported++;
    }

    revalidateBlog();
    return ok({ imported, categories: contentCategories.length, reset });
  } catch (e) {
    return serverError(`Import failed: ${e instanceof Error ? e.message : String(e)}`);
  }
}
