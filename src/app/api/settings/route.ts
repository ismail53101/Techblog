import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, badRequest, ok, serverError } from "@/lib/api";
import { SETTING_KEYS, SETTINGS_TAG, saveSiteSettings } from "@/lib/settings";

export const runtime = "nodejs";

const schema = z.object({
  ga4Id: z.string().trim().max(40).optional().default(""),
  gscVerification: z.string().trim().max(200).optional().default(""),
});

export async function GET() {
  const { response } = await requireAuth(["ADMIN"]);
  if (response) return response;
  try {
    const rows = await prisma.siteSetting.findMany();
    const map = new Map(rows.map((r) => [r.key, r.value]));
    return ok({
      ga4Id: map.get(SETTING_KEYS.ga4Id) || "",
      gscVerification: map.get(SETTING_KEYS.gscVerification) || "",
    });
  } catch {
    return ok({ ga4Id: "", gscVerification: "" });
  }
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

  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest("Validation failed", parsed.error.flatten());

  const ga = parsed.data.ga4Id.trim();
  if (ga && !/^G-[A-Z0-9]{4,}$/i.test(ga)) {
    return badRequest("GA4 Measurement ID should look like G-XXXXXXXXXX");
  }

  try {
    await saveSiteSettings({
      [SETTING_KEYS.ga4Id]: ga,
      [SETTING_KEYS.gscVerification]: parsed.data.gscVerification.trim(),
    });
    // Refresh the cached settings and re-render pages so the GA4 script /
    // Search Console meta tag appear immediately.
    revalidateTag(SETTINGS_TAG);
    revalidatePath("/", "layout");
    return ok({ success: true });
  } catch {
    return serverError("Could not save settings");
  }
}
