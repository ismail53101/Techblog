import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";
import { auth } from "@/lib/auth";

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function badRequest(message = "Bad request", issues?: unknown) {
  return NextResponse.json({ error: message, ...(issues ? { issues } : {}) }, { status: 400 });
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function conflict(message = "Already exists") {
  return NextResponse.json({ error: message }, { status: 409 });
}

export function tooManyRequests() {
  return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
}

export function serverError(message = "Something went wrong") {
  return NextResponse.json({ error: message }, { status: 500 });
}

type AuthUser = { id: string; role: Role; name?: string | null; email?: string | null };

/**
 * Guard an API route. Returns `{ user }` when authorized, or `{ response }`
 * with a 401/403 to return immediately.
 */
export async function requireAuth(
  roles?: Role[]
): Promise<{ user: AuthUser; response: null } | { user: null; response: NextResponse }> {
  const session = await auth();
  const user = session?.user as AuthUser | undefined;
  if (!user) return { user: null, response: unauthorized() };
  if (roles && !roles.includes(user.role)) return { user: null, response: forbidden() };
  return { user, response: null };
}
