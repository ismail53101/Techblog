import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { userUpdateSchema } from "@/lib/validations";
import { requireAuth, badRequest, conflict, notFound, ok, serverError } from "@/lib/api";

export const runtime = "nodejs";

type Params = { params: { id: string } };

export async function PATCH(request: Request, { params }: Params) {
  const { user, response } = await requireAuth(["ADMIN"]);
  if (response) return response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid request body");
  }

  const parsed = userUpdateSchema.safeParse(body);
  if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());
  const d = parsed.data;

  if (params.id === user.id && d.role && d.role !== "ADMIN") {
    return badRequest("You can't change your own role.");
  }

  const data: Prisma.UserUpdateInput = {};
  if (d.name !== undefined) data.name = d.name;
  if (d.email !== undefined) data.email = d.email;
  if (d.role !== undefined) data.role = d.role;
  if (d.bio !== undefined) data.bio = d.bio || null;
  if (d.avatarUrl !== undefined) data.avatarUrl = d.avatarUrl || null;
  if (d.twitter !== undefined) data.twitter = d.twitter || null;
  if (d.github !== undefined) data.github = d.github || null;
  if (d.website !== undefined) data.website = d.website || null;
  if (d.password) data.passwordHash = await bcrypt.hash(d.password, 12);

  try {
    const updated = await prisma.user.update({
      where: { id: params.id },
      data,
      select: { id: true, name: true, email: true, role: true },
    });
    return ok(updated);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") return conflict("A user with that email already exists");
      if (e.code === "P2025") return notFound("User not found");
    }
    return serverError("Could not update user");
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { user, response } = await requireAuth(["ADMIN"]);
  if (response) return response;

  if (params.id === user.id) return badRequest("You can't delete your own account.");

  const count = await prisma.post.count({ where: { authorId: params.id } });
  if (count > 0) {
    return conflict(`This user has ${count} post(s). Reassign them before deleting.`);
  }

  try {
    await prisma.user.delete({ where: { id: params.id } });
    return ok({ success: true });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return notFound("User not found");
    }
    return serverError("Could not delete user");
  }
}
