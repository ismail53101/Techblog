import { generateRssFeed } from "@/lib/rss";

// Always render from the live database so the feed reflects current articles.
export const dynamic = "force-dynamic";

export async function GET() {
  const xml = await generateRssFeed();
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
