import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export const SETTINGS_TAG = "site-settings";

export const SETTING_KEYS = {
  ga4Id: "ga4_id",
  gscVerification: "gsc_verification",
} as const;

export type SiteSettings = {
  ga4Id: string;
  gscVerification: string;
};

/**
 * Cached read of editable site settings (GA4 ID, Search Console code).
 * Never throws — returns empty strings if the table/DB isn't ready yet.
 * Invalidated via revalidateTag(SETTINGS_TAG) when the admin saves.
 */
export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    try {
      const rows = await prisma.siteSetting.findMany();
      const map = new Map(rows.map((r) => [r.key, r.value]));
      return {
        ga4Id: (map.get(SETTING_KEYS.ga4Id) || "").trim(),
        gscVerification: (map.get(SETTING_KEYS.gscVerification) || "").trim(),
      };
    } catch {
      return { ga4Id: "", gscVerification: "" };
    }
  },
  ["site-settings"],
  { tags: [SETTINGS_TAG], revalidate: 300 }
);

/** Upsert one or more settings by key. */
export async function saveSiteSettings(values: Record<string, string>): Promise<void> {
  const entries = Object.entries(values);
  for (const [key, value] of entries) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
}
