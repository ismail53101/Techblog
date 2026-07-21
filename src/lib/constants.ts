/**
 * Central, environment-driven site configuration.
 * Change the brand, description, and URL via environment variables — no code edits needed.
 */

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "TechBlog",
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    "In-depth guides, reviews, and how-tos on AI tools, software, security, and the web.",
  url: stripTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  tagline: "Technology, decoded.",
  twitter: "@techblog",
  themeColor: "#4f46e5",
  locale: "en_US",
  socials: {
    twitter: "https://twitter.com",
    github: "https://github.com",
    youtube: "https://youtube.com",
    rss: "/feed.xml",
  },
} as const;

export const mainNav: { title: string; href: string }[] = [
  { title: "Home", href: "/" },
  { title: "Blog", href: "/blog" },
  { title: "Categories", href: "/category" },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
];

export const footerNav: { title: string; items: { title: string; href: string }[] }[] = [
  {
    title: "Explore",
    items: [
      { title: "Latest", href: "/blog" },
      { title: "Categories", href: "/category" },
      { title: "Search", href: "/search" },
      { title: "RSS Feed", href: "/feed.xml" },
    ],
  },
  {
    title: "Company",
    items: [
      { title: "About", href: "/about" },
      { title: "Contact", href: "/contact" },
      { title: "Privacy Policy", href: "/privacy" },
      { title: "Terms", href: "/terms" },
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
