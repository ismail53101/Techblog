import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export const SETTINGS_TAG = "site-settings";

export const SETTING_KEYS = {
  ga4Id: "ga4_id",
  gscVerification: "gsc_verification",
  socialGithub: "social_github",
  socialYoutube: "social_youtube",
  socialTwitter: "social_twitter",
  socialFacebook: "social_facebook",
  socialLinkedin: "social_linkedin",
} as const;

export type SocialLinksSettings = {
  github: string;
  youtube: string;
  twitter: string;
  facebook: string;
  linkedin: string;
};

export const EMPTY_SOCIAL: SocialLinksSettings = {
  github: "",
  youtube: "",
  twitter: "",
  facebook: "",
  linkedin: "",
};

export type SiteSettings = {
  ga4Id: string;
  gscVerification: string;
  social: SocialLinksSettings;
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
      const get = (k: string) => (map.get(k) || "").trim();
      return {
        ga4Id: get(SETTING_KEYS.ga4Id),
        gscVerification: get(SETTING_KEYS.gscVerification),
        social: {
          github: get(SETTING_KEYS.socialGithub),
          youtube: get(SETTING_KEYS.socialYoutube),
          twitter: get(SETTING_KEYS.socialTwitter),
          facebook: get(SETTING_KEYS.socialFacebook),
          linkedin: get(SETTING_KEYS.socialLinkedin),
        },
      };
    } catch {
      return { ga4Id: "", gscVerification: "", social: { ...EMPTY_SOCIAL } };
    }
  },
  ["site-settings"],
  // Short revalidate so changes (and post-deploy DB reads) surface quickly; an
  // admin save also busts this immediately via revalidateTag(SETTINGS_TAG).
  { tags: [SETTINGS_TAG], revalidate: 60 }
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
