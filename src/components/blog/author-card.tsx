import Link from "next/link";
import { Github, Globe, Twitter } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

type Author = {
  id: string;
  name: string;
  bio?: string | null;
  avatarUrl?: string | null;
  twitter?: string | null;
  github?: string | null;
  website?: string | null;
};

export function AuthorCard({ author }: { author: Author }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-start">
      <Avatar src={author.avatarUrl} name={author.name} size={64} />
      <div className="flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Written by</p>
        <Link href={`/author/${author.id}`} className="font-heading text-lg font-semibold hover:underline">
          {author.name}
        </Link>
        {author.bio && <p className="mt-1 text-sm text-muted-foreground">{author.bio}</p>}
        <div className="mt-3 flex items-center gap-3 text-muted-foreground">
          {author.twitter && (
            <a href={`https://twitter.com/${author.twitter}`} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-foreground">
              <Twitter className="size-4" />
            </a>
          )}
          {author.github && (
            <a href={`https://github.com/${author.github}`} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-foreground">
              <Github className="size-4" />
            </a>
          )}
          {author.website && (
            <a href={author.website} target="_blank" rel="noopener noreferrer" aria-label="Website" className="hover:text-foreground">
              <Globe className="size-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
