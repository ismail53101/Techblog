"use client";

import * as React from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Google Analytics 4 loader + SPA tracking. Renders nothing unless a
 * Measurement ID is provided (set from the admin Settings page). Tracks:
 *  - page_view on every client-side route change (initial handled by config)
 *  - outbound link clicks and file downloads (delegated document listener)
 * Article views, search, etc. are sent from their own components via trackEvent.
 */
export function Analytics({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const firstLoad = React.useRef(true);

  React.useEffect(() => {
    if (!measurementId) return;
    if (firstLoad.current) {
      firstLoad.current = false; // initial page_view sent by gtag config
      return;
    }
    const qs = searchParams?.toString();
    window.gtag?.("event", "page_view", {
      page_path: qs ? `${pathname}?${qs}` : pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, searchParams, measurementId]);

  React.useEffect(() => {
    if (!measurementId) return;
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      const href = anchor?.getAttribute("href");
      if (!href) return;
      try {
        const url = new URL(href, window.location.href);
        const isDownload =
          anchor!.hasAttribute("download") ||
          /\.(zip|pdf|dmg|exe|apk|msi|rar|7z|mp3|mp4|csv|xlsx?|docx?|pptx?)$/i.test(url.pathname);
        if (isDownload) {
          window.gtag?.("event", "file_download", {
            link_url: url.href,
            file_name: url.pathname.split("/").pop(),
          });
        } else if (url.origin !== window.location.origin) {
          window.gtag?.("event", "click", { link_url: url.href, link_domain: url.hostname, outbound: true });
        }
      } catch {
        /* ignore malformed hrefs */
      }
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [measurementId]);

  if (!measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${measurementId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
