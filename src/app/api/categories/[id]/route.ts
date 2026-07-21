import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validations";
import { slugify } from "@/lib/slugify";
import { requireAuth, badRequest, conflict, notFound, ok, serverError } from "@/lib/api";

export const runtime = "nodejs";

type Params = { params: { id: string } };

export async function PATCH(request: Request, { params }: Params) {
  const { response } = await requireAuth(["ADMIN", "EDITOR"]);
  if (response) return response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid request body");
  }

  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());
  const d = parsed.data;

  try {
    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        name: d.name,
        description: d.description ?? null,
        ...(d.slug ? { slug: slugify(d.slug) } : {}),
      },
    });
    revalidatePath("/category");
    revalidatePath(`/category/${category.slug}`);
    return ok(category);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") return conflict("A category with that name or slug already exists");
      if (e.code === "P2025") return notFound("Category not found");
    }
    return serverError("Could not update category");
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { response } = await requireAuth(["ADMIN", "EDITOR"]);
  if (response) return response;

  const count = await prisma.post.count({ where: { categoryId: params.id } });
  if (count > 0) {
    return conflict(`This category has ${count} post(s). Reassign them before deleting.`);
  }

  try {
    await prisma.category.delete({ where: { id: params.id } });
    revalidatePath("/category");
    return ok({ success: true });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return notFound("Category not found");
    }
    return serverError("Could not delete category");
  }
}
