import Link from "next/link";
import { siteConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * FixPedia brand mark — a rounded-square gradient tile with a white "F"
 * monogram and a spark dot. Uses a fixed brand gradient so it reads well in
 * both light and dark mode. Purely decorative (aria-hidden); the wordmark
 * carries the accessible name.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="fixpedia-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#fixpedia-grad)" />
      <rect x="12.5" y="10" width="5" height="20" rx="1.6" fill="#fff" />
      <rect x="12.5" y="10" width="15.5" height="5" rx="1.6" fill="#fff" />
      <rect x="12.5" y="17.8" width="11.5" height="5" rx="1.6" fill="#fff" />
      <circle cx="30.4" cy="27.6" r="2.7" fill="#fff" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} home`}
      className={cn("flex items-center gap-2 font-heading text-lg font-bold tracking-tight", className)}
    >
      <LogoMark className="size-8" />
      <span>{siteConfig.name}</span>
    </Link>
  );
}
