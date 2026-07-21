import type { ComponentType } from "react";
import Link from "next/link";
import { Facebook, Github, Linkedin, Rss, Youtube } from "lucide-react";
import type { SocialLinksSettings } from "@/lib/settings";
import { siteConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Modern X (formerly Twitter) glyph — lucide only ships the legacy bird. */
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

type Entry = {
  key: string;
  label: string;
  href: string;
  Icon: ComponentType<{ className?: string }>;
  hover: string;
};

/**
 * Renders the configured social icons.
 * - Any platform with an empty URL is automatically omitted.
 * - External profiles open in a new tab with rel="noopener noreferrer".
 * - RSS links to the on-site subscribe page (/rss).
 * - Each link has an accessible label and a branded hover treatment.
 */
export function SocialLinks({
  social,
  className,
  iconClassName,
}: {
  social: SocialLinksSettings;
  className?: string;
  iconClassName?: string;
}) {
  const entries: Entry[] = [];
  if (social.github)
    entries.push({ key: "github", label: "GitHub", href: social.github, Icon: Github, hover: "hover:text-foreground" });
  if (social.youtube)
    entries.push({ key: "youtube", label: "YouTube", href: social.youtube, Icon: Youtube, hover: "hover:text-[#FF0000]" });
  if (social.twitter)
    entries.push({ key: "twitter", label: "X (formerly Twitter)", href: social.twitter, Icon: XIcon, hover: "hover:text-foreground" });
  if (social.facebook)
    entries.push({ key: "facebook", label: "Facebook", href: social.facebook, Icon: Facebook, hover: "hover:text-[#1877F2]" });
  if (social.linkedin)
    entries.push({ key: "linkedin", label: "LinkedIn", href: social.linkedin, Icon: Linkedin, hover: "hover:text-[#0A66C2]" });

  const base =
    "inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
  const icon = cn("size-4", iconClassName);

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {entries.map(({ key, label, href, Icon, hover }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${siteConfig.name} on ${label} (opens in a new tab)`}
          title={label}
          className={cn(base, hover)}
        >
          <Icon className={icon} />
        </a>
      ))}

      {/* RSS → friendly on-site subscribe page (not the raw XML). */}
      <Link
        href="/rss"
        aria-label={`Subscribe to the ${siteConfig.name} RSS feed`}
        title="RSS feed"
        className={cn(base, "hover:text-[#EE802F]")}
      >
        <Rss className={icon} aria-hidden="true" />
      </Link>
    </div>
  );
}
