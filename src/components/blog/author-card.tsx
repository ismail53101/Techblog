import Link from "next/link";
import { Github, Globe, Twitter } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { formatDate, toISO } from "@/lib/utils";

type Author = {
  id: string;
  name: string;
  bio?: string | null;
  avatarUrl?: string | null;
  twitter?: string | null;
  github?: string | null;
  website?: string | null;
};

export function AuthorCard({ author, date }: { author: Author; date?: Date | string | null }) {
  const socials = [
    author.twitter && { label: "Twitter", href: `https://twitter.com/${author.twitter}`, Icon: Twitter },
    author.github && { label: "GitHub", href: `https://github.com/${author.github}`, Icon: Github },
    author.website && { label: "Website", href: author.website, Icon: Globe },
  ].filter(Boolean) as { label: string; href: string; Icon: typeof Twitter }[];

  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl border border-border bg-card p-6 text-center sm:flex-row sm:items-center sm:gap-6 sm:p-7 sm:text-left">
      <Avatar src={author.avatarUrl} name={author.name} size={72} className="shadow-sm" />

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Written by</p>
        <Link
          href={`/author/${author.id}`}
          className="mt-0.5 inline-block font-heading text-xl font-bold leading-tight transition-colors hover:text-primary"
        >
          {author.name}
        </Link>
        {date && (
          <p className="mt-0.5 text-sm text-muted-foreground">
            Published <time dateTime={toISO(date)}>{formatDate(date)}</time>
          </p>
        )}
        {author.bio && <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{author.bio}</p>}

        {socials.length > 0 && (
          <div className="mt-4 flex items-center justify-center gap-2 sm:justify-start">
            {socials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${author.name} on ${label}`}
                className="inline-flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
