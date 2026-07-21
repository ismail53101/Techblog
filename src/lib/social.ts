import { SETTING_KEYS } from "@/lib/settings";

/**
 * Ordered catalog of the social platforms the site supports.
 * Used by the admin form (labels/placeholders/validation) and by the settings
 * API (mapping form field -> SiteSetting key). Icons live in the presentational
 * `SocialLinks` component so this module stays server/client safe.
 */
export const SOCIAL_PLATFORMS = [
  {
    key: "github",
    label: "GitHub",
    settingKey: SETTING_KEYS.socialGithub,
    placeholder: "https://github.com/your-username",
    optional: false,
  },
  {
    key: "youtube",
    label: "YouTube",
    settingKey: SETTING_KEYS.socialYoutube,
    placeholder: "https://youtube.com/@your-channel",
    optional: false,
  },
  {
    key: "twitter",
    label: "X (Twitter)",
    settingKey: SETTING_KEYS.socialTwitter,
    placeholder: "https://x.com/your-handle",
    optional: false,
  },
  {
    key: "facebook",
    label: "Facebook",
    settingKey: SETTING_KEYS.socialFacebook,
    placeholder: "https://facebook.com/your-page",
    optional: true,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    settingKey: SETTING_KEYS.socialLinkedin,
    placeholder: "https://linkedin.com/in/your-profile",
    optional: true,
  },
] as const;

export type SocialKey = (typeof SOCIAL_PLATFORMS)[number]["key"];
