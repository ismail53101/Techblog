import { stripHtml } from "@/lib/utils";

export type FaqItem = { question: string; answer: string };

/**
 * Extract FAQ pairs from article HTML. Looks for a "Frequently Asked Questions"
 * (or "FAQ") <h2>, then reads each following <h3> (question) + text (answer)
 * until the next <h2>. Used to emit FAQPage structured data.
 */
export function extractFaq(html: string): FaqItem[] {
  const section = html.match(
    /<h2[^>]*>\s*(?:frequently asked questions|faqs?)\s*<\/h2>([\s\S]*?)(?:<h2|$)/i
  );
  if (!section) return [];
  const items: FaqItem[] = [];
  const re = /<h3[^>]*>([\s\S]*?)<\/h3>([\s\S]*?)(?=<h3|$)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(section[1])) !== null) {
    const question = stripHtml(m[1]);
    const answer = stripHtml(m[2]);
    if (question && answer) items.push({ question, answer });
  }
  return items;
}
