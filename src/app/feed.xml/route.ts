import { generateRssFeed } from "@/lib/rss";

export const revalidate = 3600;

export async function GET() {
  const xml = await generateRssFeed();
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
