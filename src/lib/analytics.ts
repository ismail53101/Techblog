declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/** Send a GA4 event (no-op if analytics isn't loaded). */
export function trackEvent(name: string, params: Record<string, unknown> = {}): void {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", name, params);
  }
}
