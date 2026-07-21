const WORDS_PER_MINUTE = 220;

/** Estimate reading time in minutes from HTML or plain text. */
export function readingTime(content: string): number {
  const words = content
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function readingTimeLabel(minutes: number): string {
  return `${minutes} min read`;
}
