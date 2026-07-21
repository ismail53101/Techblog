import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validations";
import { slugify } from "@/lib/slugify";
import { getCategoriesWithCounts } from "@/lib/posts";
import { requireAuth, badRequest, conflict, ok, serverError } from "@/lib/api";

export const runtime = "nodejs";

export async function GET() {
  const { response } = await requireAuth(["ADMIN", "EDITOR", "AUTHOR"]);
  if (response) return response;
  const categories = await getCategoriesWithCounts();
  return ok({ categories });
}

export async function POST(request: Request) {
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
    const category = await prisma.category.create({
      data: { name: d.name, slug: slugify(d.slug || d.name), description: d.description || null },
    });
    revalidatePath("/category");
    revalidatePath("/");
    return ok(category, 201);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return conflict("A category with that name or slug already exists");
    }
    return serverError("Could not create category");
  }
}
