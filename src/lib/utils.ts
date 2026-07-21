import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import { siteConfig } from "@/lib/constants";

/** Merge Tailwind class names, resolving conflicts. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Build an absolute URL from a path using the configured site URL. */
export function absoluteUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${clean}`;
}

/** Format a date as e.g. "Jul 20, 2026". */
export function formatDate(date: Date | string | number): string {
  return format(new Date(date), "MMM d, yyyy");
}

/** ISO 8601 string for <time dateTime> and structured data. */
export function toISO(date: Date | string | number): string {
  return new Date(date).toISOString();
}

/** Relative time, e.g. "3 days ago". */
export function timeAgo(date: Date | string | number): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/** Truncate a string to a max length on a word boundary. */
export function truncate(text: string, max = 160): string {
  if (text.length <= max) return text;
  return text.slice(0, text.lastIndexOf(" ", max)).trimEnd() + "…";
}

/** Initials for avatar fallbacks. */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Strip HTML tags to plain text (used for previews and search indexing). */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
