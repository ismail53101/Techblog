import { prisma } from "@/lib/prisma";
import { revalidateBlog } from "@/lib/post-mutations";
import { ok, unauthorized } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Publishes any scheduled posts whose time has arrived.
 * Invoked by Vercel Cron with `Authorization: Bearer <CRON_SECRET>`.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return unauthorized();
  }

  const now = new Date();
  const due = await prisma.post.findMany({
    where: { status: "SCHEDULED", publishedAt: { lte: now } },
    select: { id: true, slug: true },
  });

  if (due.length > 0) {
    await prisma.post.updateMany({
      where: { id: { in: due.map((d) => d.id) } },
      data: { status: "PUBLISHED" },
    });
    revalidateBlog();
    for (const post of due) revalidateBlog(post.slug);
  }

  return ok({ published: due.length, at: now.toISOString() });
}
