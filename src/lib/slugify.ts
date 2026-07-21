/** Convert arbitrary text into a URL-safe slug. */
export function slugify(input: string): string {
  const normalized = input.toString().normalize("NFKD");
  // Remove combining diacritical marks (U+0300–U+036F) without embedding
  // non-ASCII characters in the source.
  let stripped = "";
  for (const ch of normalized) {
    const code = ch.codePointAt(0) ?? 0;
    if (code >= 0x300 && code <= 0x36f) continue;
    stripped += ch;
  }
  return stripped
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Given a base slug and a set of existing slugs, return a unique slug by
 * appending -2, -3, ... when needed.
 */
export function uniqueSlug(base: string, existing: Set<string>): string {
  const slug = slugify(base) || "post";
  if (!existing.has(slug)) return slug;
  let n = 2;
  while (existing.has(`${slug}-${n}`)) n++;
  return `${slug}-${n}`;
}
