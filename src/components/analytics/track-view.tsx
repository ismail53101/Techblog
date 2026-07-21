"use client";

import * as React from "react";
import { trackEvent } from "@/lib/analytics";

/** Fires a GA4 event once on mount (e.g. article_view). Renders nothing. */
export function TrackView({
  event,
  params,
}: {
  event: string;
  params?: Record<string, unknown>;
}) {
  React.useEffect(() => {
    trackEvent(event, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
