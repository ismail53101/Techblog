import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { userCreateSchema } from "@/lib/validations";
import { requireAuth, badRequest, conflict, ok, serverError } from "@/lib/api";

export const runtime = "nodejs";

export async function GET() {
  const { response } = await requireAuth(["ADMIN"]);
  if (response) return response;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
      _count: { select: { posts: true } },
    },
  });
  return ok({ users });
}

export async function POST(request: Request) {
  const { response } = await requireAuth(["ADMIN"]);
  if (response) return response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid request body");
  }

  const parsed = userCreateSchema.safeParse(body);
  if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());
  const d = parsed.data;

  try {
    const passwordHash = await bcrypt.hash(d.password, 12);
    const user = await prisma.user.create({
      data: {
        name: d.name,
        email: d.email,
        passwordHash,
        role: d.role,
        bio: d.bio || null,
        avatarUrl: d.avatarUrl || null,
        twitter: d.twitter || null,
        github: d.github || null,
        website: d.website || null,
      },
      select: { id: true, name: true, email: true, role: true },
    });
    return ok(user, 201);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return conflict("A user with that email already exists");
    }
    return serverError("Could not create user");
  }
}
