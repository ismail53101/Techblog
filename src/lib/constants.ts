/**
 * Central, environment-driven site configuration.
 * Change the brand, description, and URL via environment variables — no code edits needed.
 */

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "FixPedia",
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    "Practical tech guides, reviews, and fixes for AI tools, Windows, Android, iPhone, software, and cybersecurity.",
  url: stripTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  tagline: "Fix it. Learn it. Master it.",
  twitter: "@fixpedia",
  themeColor: "#4f46e5",
  locale: "en_US",
} as const;

export const mainNav: { title: string; href: string }[] = [
  { title: "Home", href: "/" },
  { title: "Latest Articles", href: "/blog" },
  { title: "Categories", href: "/category" },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
];

export const legalNav: { title: string; href: string }[] = [
  { title: "Privacy Policy", href: "/privacy" },
  { title: "Terms & Conditions", href: "/terms" },
  { title: "Disclaimer", href: "/disclaimer" },
];

export const footerNav: { title: string; items: { title: string; href: string }[] }[] = [
  {
    title: "Explore",
    items: [
      { title: "Latest Articles", href: "/blog" },
      { title: "Categories", href: "/category" },
      { title: "Search", href: "/search" },
      { title: "RSS Feed", href: "/rss" },
    ],
  },
  {
    title: "Company",
    items: [
      { title: "About Us", href: "/about" },
      { title: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    items: [
      { title: "Privacy Policy", href: "/privacy" },
      { title: "Terms & Conditions", href: "/terms" },
      { title: "Disclaimer", href: "/disclaimer" },
    ],
  },
];

/**
 * Fallback category list used for navigation when the database is unavailable
 * (e.g. during a build without a DB connection). The live site reads categories
 * from the database.
 */
export const defaultCategories: { name: string; slug: string }[] = [
  { name: "AI Tools", slug: "ai-tools" },
  { name: "Windows", slug: "windows" },
  { name: "Android", slug: "android" },
  { name: "iPhone", slug: "iphone" },
  { name: "Software Reviews", slug: "software-reviews" },
  { name: "Productivity", slug: "productivity" },
  { name: "Cybersecurity", slug: "cybersecurity" },
  { name: "Blogging", slug: "blogging" },
  { name: "Troubleshooting", slug: "troubleshooting" },
  { name: "Web Development", slug: "web-development" },
];

export const POSTS_PER_PAGE = 9;
export const RELATED_POSTS_COUNT = 3;
export const SEARCH_RESULTS_LIMIT = 20;
