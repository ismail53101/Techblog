import { siteConfig } from "@/lib/constants";

export const revalidate = 3600;

/**
 * Sitemap index. Points to the main dynamic sitemap (which lists all posts,
 * categories, tags, and pages). Submit either /sitemap.xml or this index to
 * Google Search Console.
 */
export async function GET() {
  const now = new Date().toISOString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${siteConfig.url}/sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
