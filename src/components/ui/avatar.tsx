"use client";

import * as React from "react";
import { User } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

/**
 * Circular avatar that never shows a broken image.
 * - Renders a premium FixPedia-branded gradient monogram by default.
 * - If a photo URL is provided it overlays the monogram; on any load error
 *   (404, blocked by CSP, offline…) it silently falls back to the monogram.
 * - The gradient + initials always sit underneath, so there is never a flash
 *   of a broken image or an empty circle.
 */
export function Avatar({
  src,
  name,
  size = 40,
  className,
}: {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = React.useState(false);
  React.useEffect(() => setFailed(false), [src]);

  const cleanSrc = src?.trim() || "";
  const showImg = cleanSrc.length > 0 && !failed;
  const initials = getInitials(name);

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full",
        "bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 text-white",
        "ring-1 ring-black/5 dark:ring-white/10",
        className
      )}
      style={{ width: size, height: size }}
    >
      {/* Always-present branded fallback layer */}
      {initials ? (
        <span
          className="font-heading font-semibold leading-none tracking-tight"
          style={{ fontSize: Math.max(11, Math.round(size / 2.4)) }}
        >
          {initials}
        </span>
      ) : (
        <User style={{ width: Math.round(size * 0.55), height: Math.round(size * 0.55) }} aria-hidden />
      )}

      {/* Optional photo overlay — hidden automatically if it fails to load */}
      {showImg && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cleanSrc}
          alt={name}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <span className="sr-only">{name}</span>
    </span>
  );
}
