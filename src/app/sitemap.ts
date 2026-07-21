import type { MetadataRoute } from "next";
import { getAllCategories, getAllPublishedPostRefs, getAllTagsWithCounts } from "@/lib/posts";
import { absoluteUrl } from "@/lib/utils";

// Always render from the live database so the sitemap reflects the current set
// of articles, categories, and tags (and updates the moment content changes).
export const dynamic = "force-dynamic";

type Item = MetadataRoute.Sitemap[number];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categories, tags] = await Promise.all([
    getAllPublishedPostRefs(),
    getAllCategories(),
    getAllTagsWithCounts(),
  ]);

  const now = new Date();

  const staticItems: Item[] = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/blog"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/category"), lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: absoluteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/contact"), lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/privacy"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/terms"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const postItems: Item[] = posts.map((p) => ({
    url: absoluteUrl(`/blog/${p.slug}`),
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryItems: Item[] = categories.map((c) => ({
    url: absoluteUrl(`/category/${c.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const tagItems: Item[] = tags.map((t) => ({
    url: absoluteUrl(`/tag/${t.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.3,
  }));

  return [...staticItems, ...postItems, ...categoryItems, ...tagItems];
}
