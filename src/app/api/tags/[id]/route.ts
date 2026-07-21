import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { tagSchema } from "@/lib/validations";
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

  const parsed = tagSchema.safeParse(body);
  if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());
  const d = parsed.data;

  try {
    const tag = await prisma.tag.update({
      where: { id: params.id },
      data: { name: d.name, ...(d.slug ? { slug: slugify(d.slug) } : {}) },
    });
    return ok(tag);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") return conflict("A tag with that name or slug already exists");
      if (e.code === "P2025") return notFound("Tag not found");
    }
    return serverError("Could not update tag");
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { response } = await requireAuth(["ADMIN", "EDITOR"]);
  if (response) return response;

  try {
    await prisma.tag.delete({ where: { id: params.id } });
    return ok({ success: true });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return notFound("Tag not found");
    }
    return serverError("Could not delete tag");
  }
}
