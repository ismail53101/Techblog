import {
  BookOpen,
  Code,
  Download,
  Globe,
  Hash,
  type LucideIcon,
  Monitor,
  Package,
  PenTool,
  Phone,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  TrendingUp,
  Wrench,
  Zap,
} from "lucide-react";

/** Preferred display order for the known categories (by slug). */
export const CATEGORY_SLUG_ORDER = [
  "ai-tools",
  "windows",
  "android",
  "iphone-ios",
  "software",
  "cybersecurity",
  "troubleshooting",
  "reviews",
  "productivity",
  "downloads",
  "blogging",
  "seo",
  "web-development",
  "internet-tips",
  "how-to-guides",
] as const;

/** A modern icon for each known category, matched by slug. */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "ai-tools": Sparkles,
  windows: Monitor,
  android: Smartphone,
  "iphone-ios": Phone,
  software: Package,
  cybersecurity: ShieldCheck,
  troubleshooting: Wrench,
  reviews: Star,
  productivity: Zap,
  downloads: Download,
  blogging: PenTool,
  seo: TrendingUp,
  "web-development": Code,
  "internet-tips": Globe,
  "how-to-guides": BookOpen,
};

export function getCategoryIcon(slug: string): LucideIcon {
  return CATEGORY_ICONS[slug] ?? Hash;
}

const ORDER_INDEX = new Map<string, number>(CATEGORY_SLUG_ORDER.map((s, i) => [s, i]));

/** Sort any list of `{ slug, name }` into the preferred category order. */
export function sortByCategoryOrder<T extends { slug: string; name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const ai = ORDER_INDEX.has(a.slug) ? (ORDER_INDEX.get(a.slug) as number) : 999;
    const bi = ORDER_INDEX.has(b.slug) ? (ORDER_INDEX.get(b.slug) as number) : 999;
    return ai !== bi ? ai - bi : a.name.localeCompare(b.name);
  });
}
