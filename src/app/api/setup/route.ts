import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runSeed } from "@/lib/seed-core";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * TEMPORARY one-time setup endpoint.
 *
 * Runs the database seed (creating the admin user from ADMIN_EMAIL / ADMIN_NAME /
 * ADMIN_PASSWORD, plus default categories and sample posts) once, then makes
 * itself inert.
 *
 * Security:
 *  - Requires a secret: `?key=<SETUP_SECRET or CRON_SECRET>` (or `x-setup-key` header).
 *  - Self-disables: once an ADMIN user exists, it does nothing on subsequent calls.
 *  - Kill switch: set SETUP_DISABLED=true to hard-disable.
 *
 * DELETE THIS FILE (and redeploy) once your admin account works.
 */
async function handle(request: Request) {
  if (process.env.SETUP_DISABLED === "true") {
    return NextResponse.json({ error: "Setup is disabled." }, { status: 410 });
  }

  const secret = process.env.SETUP_SECRET || process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Setup is not configured. Set SETUP_SECRET (or CRON_SECRET) in your environment." },
      { status: 500 }
    );
  }

  const url = new URL(request.url);
  const key = url.searchParams.get("key") ?? request.headers.get("x-setup-key");
  if (key !== secret) {
    return NextResponse.json(
      { error: "Unauthorized. Append ?key=YOUR_SECRET to the URL." },
      { status: 401 }
    );
  }

  // Self-disable: if an admin already exists, do nothing.
  let adminCount = 0;
  try {
    adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  } catch (e) {
    return NextResponse.json(
      {
        error: "Database not reachable or not migrated yet. Ensure `prisma migrate deploy` has run.",
        detail: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }

  if (adminCount > 0) {
    return NextResponse.json({
      ok: true,
      status: "already-initialized",
      message: "An admin already exists. This endpoint is now inert — safe to delete /api/setup and redeploy.",
    });
  }

  try {
    const result = await runSeed(prisma);
    return NextResponse.json({
      ok: true,
      status: "seeded",
      admin: result.adminEmail,
      categories: result.categories,
      posts: result.posts,
      message:
        "Setup complete. Sign in at /admin with ADMIN_EMAIL / ADMIN_PASSWORD, then DELETE /api/setup (or set SETUP_DISABLED=true) and redeploy.",
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Seed failed.", detail: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}

export const GET = handle;
export const POST = handle;
