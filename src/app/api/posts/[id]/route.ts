import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { postSchema } from "@/lib/validations";
import { sanitize } from "@/lib/sanitize";
import { readingTime } from "@/lib/reading-time";
import { slugify } from "@/lib/slugify";
import { requireAuth, badRequest, conflict, forbidden, notFound, ok, serverError } from "@/lib/api";
import { resolvePublish, revalidateBlog, uniquePostSlug } from "@/lib/post-mutations";

export const runtime = "nodejs";

type Params = { params: { id: string } };

export async function GET(_request: Request, { params }: Params) {
  const { user, response } = await requireAuth(["ADMIN", "EDITOR", "AUTHOR"]);
  if (response) return response;

  const post = await prisma.post.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      coverImage: true,
      coverImageAlt: true,
      status: true,
      featured: true,
      metaTitle: true,
      metaDescription: true,
      publishedAt: true,
      authorId: true,
      categoryId: true,
      tags: { select: { name: true } },
    },
  });

  if (!post) return notFound("Post not found");
  if (user.role === "AUTHOR" && post.authorId !== user.id) return forbidden();

  return ok({ post: { ...post, tags: post.tags.map((t) => t.name) } });
}

export async function PATCH(request: Request, { params }: Params) {
  const { user, response } = await requireAuth(["ADMIN", "EDITOR", "AUTHOR"]);
  if (response) return response;

  const existing = await prisma.post.findUnique({
    where: { id: params.id },
    select: { authorId: true, slug: true, category: { select: { slug: true } } },
  });
  if (!existing) return notFound("Post not found");
  if (user.role === "AUTHOR" && existing.authorId !== user.id) return forbidden();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid request body");
  }

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());
  const d = parsed.data;

  const slug = await uniquePostSlug(d.slug || d.title, params.id);
  const content = sanitize(d.content);
  const { status, publishedAt } = resolvePublish(d.status, d.publishedAt ?? null);

  try {
    const post = await prisma.post.update({
      where: { id: params.id },
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
        category: { connect: { id: d.categoryId } },
        tags: {
          set: [],
          connectOrCreate: d.tags.map((t) => ({
            where: { slug: slugify(t) },
            create: { name: t, slug: slugify(t) },
          })),
        },
      },
      select: { id: true, slug: true, category: { select: { slug: true } } },
    });

    revalidateBlog(existing.slug, existing.category?.slug);
    revalidateBlog(post.slug, post.category?.slug);
    return ok(post);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") return conflict("A post with this slug already exists");
      if (e.code === "P2003" || e.code === "P2025") return badRequest("Selected category does not exist");
    }
    return serverError("Could not update post");
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { user, response } = await requireAuth(["ADMIN", "EDITOR", "AUTHOR"]);
  if (response) return response;

  const existing = await prisma.post.findUnique({
    where: { id: params.id },
    select: { authorId: true, slug: true, category: { select: { slug: true } } },
  });
  if (!existing) return notFound("Post not found");
  if (user.role === "AUTHOR" && existing.authorId !== user.id) return forbidden();

  try {
    await prisma.post.delete({ where: { id: params.id } });
    revalidateBlog(existing.slug, existing.category?.slug);
    return ok({ success: true });
  } catch {
    return serverError("Could not delete post");
  }
}
