import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/constants";
import { absoluteUrl } from "@/lib/utils";

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Generate an RSS 2.0 feed of the most recent published posts.
 * Wrapped in try/catch so a missing database never breaks the build.
 */
export async function generateRssFeed(): Promise<string> {
  let posts: {
    title: string;
    slug: string;
    excerpt: string;
    publishedAt: Date | null;
    category: { name: string } | null;
  }[] = [];

  try {
    posts = await prisma.post.findMany({
      where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
      orderBy: { publishedAt: "desc" },
      take: 50,
      select: {
        title: true,
        slug: true,
        excerpt: true,
        publishedAt: true,
        category: { select: { name: true } },
      },
    });
  } catch {
    posts = [];
  }

  const items = posts
    .map((post) => {
      const url = absoluteUrl(`/blog/${post.slug}`);
      const pubDate = (post.publishedAt ?? new Date()).toUTCString();
      const category = post.category ? `<category>${escapeXml(post.category.name)}</category>` : "";
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <pubDate>${pubDate}</pubDate>
      ${category}
    </item>`;
    })
    .join("\n");

  const lastBuild = new Date().toUTCString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${siteConfig.url}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${absoluteUrl("/feed.xml")}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
}
