import { revalidatePath } from "next/cache";
import { requireAuth, ok } from "@/lib/api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { response } = await requireAuth(["ADMIN", "EDITOR"]);
  if (response) return response;

  let body: { paths?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    /* empty body is fine */
  }

  const paths = Array.isArray(body.paths) ? (body.paths as unknown[]) : [];
  if (paths.length === 0) {
    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath("/category");
  } else {
    for (const p of paths) {
      if (typeof p === "string" && p.startsWith("/")) revalidatePath(p);
    }
  }

  return ok({ revalidated: true });
}
