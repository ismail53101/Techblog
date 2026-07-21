import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, badRequest, ok, serverError } from "@/lib/api";
import { SETTING_KEYS, SETTINGS_TAG, saveSiteSettings } from "@/lib/settings";

export const runtime = "nodejs";

/** A full http(s) URL, or an empty string (which hides that icon). */
const urlOrEmpty = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || /^https?:\/\/\S+\.\S+/i.test(v), {
    message: "Enter a full URL starting with http:// or https://, or leave it blank.",
  })
  .default("");

const schema = z.object({
  github: urlOrEmpty,
  youtube: urlOrEmpty,
  twitter: urlOrEmpty,
  facebook: urlOrEmpty,
  linkedin: urlOrEmpty,
});

export async function GET() {
  const { response } = await requireAuth(["ADMIN"]);
  if (response) return response;
  try {
    const rows = await prisma.siteSetting.findMany();
    const m = new Map(rows.map((r) => [r.key, r.value]));
    return ok({
      github: m.get(SETTING_KEYS.socialGithub) || "",
      youtube: m.get(SETTING_KEYS.socialYoutube) || "",
      twitter: m.get(SETTING_KEYS.socialTwitter) || "",
      facebook: m.get(SETTING_KEYS.socialFacebook) || "",
      linkedin: m.get(SETTING_KEYS.socialLinkedin) || "",
    });
  } catch {
    return ok({ github: "", youtube: "", twitter: "", facebook: "", linkedin: "" });
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
  const d = parsed.data;

  try {
    // Only touches the five social keys — GA4 / Search Console settings are untouched.
    await saveSiteSettings({
      [SETTING_KEYS.socialGithub]: d.github,
      [SETTING_KEYS.socialYoutube]: d.youtube,
      [SETTING_KEYS.socialTwitter]: d.twitter,
      [SETTING_KEYS.socialFacebook]: d.facebook,
      [SETTING_KEYS.socialLinkedin]: d.linkedin,
    });
    revalidateTag(SETTINGS_TAG);
    revalidatePath("/", "layout");
    return ok({ success: true });
  } catch {
    return serverError("Could not save social links");
  }
}
