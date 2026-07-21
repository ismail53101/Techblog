import { slugify } from "@/lib/slugify";

export type TocItem = { id: string; text: string; level: 2 | 3 };

const HEADING_PATTERN = "<h([23])(\\s[^>]*)?>([\\s\\S]*?)<\\/h\\1>";

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ");
}

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}

/** Extract an ordered table of contents from the article HTML (h2 + h3). */
export function extractToc(html: string): TocItem[] {
  const re = new RegExp(HEADING_PATTERN, "gi");
  const items: TocItem[] = [];
  const counts: Record<string, number> = {};
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const level = Number(match[1]) as 2 | 3;
    const text = stripTags(match[3]);
    if (!text) continue;
    let id = slugify(text) || "section";
    if (counts[id] !== undefined) {
      counts[id] += 1;
      id = `${id}-${counts[id]}`;
    } else {
      counts[id] = 0;
    }
    items.push({ id, text, level });
  }
  return items;
}

/**
 * Inject deterministic `id` attributes into h2/h3 headings so the table of
 * contents can link to them. Uses the same id algorithm as extractToc().
 */
export function addHeadingIds(html: string): string {
  const re = new RegExp(HEADING_PATTERN, "gi");
  const counts: Record<string, number> = {};
  return html.replace(re, (_full, lvl: string, attrs: string | undefined, inner: string) => {
    const text = stripTags(inner);
    let id = slugify(text) || "section";
    if (counts[id] !== undefined) {
      counts[id] += 1;
      id = `${id}-${counts[id]}`;
    } else {
      counts[id] = 0;
    }
    const cleanedAttrs = (attrs || "").replace(/\sid="[^"]*"/i, "");
    return `<h${lvl}${cleanedAttrs} id="${id}">${inner}</h${lvl}>`;
  });
}
