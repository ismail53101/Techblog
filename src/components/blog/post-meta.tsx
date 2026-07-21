import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { formatDate, toISO } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function PostMeta({
  author,
  date,
  readingTime,
  className,
  avatarSize = 36,
}: {
  author: { id: string; name: string; avatarUrl?: string | null };
  date?: Date | string | null;
  readingTime?: number;
  className?: string;
  avatarSize?: number;
}) {
  return (
    <div className={cn("flex items-center gap-3 text-sm", className)}>
      <Avatar src={author.avatarUrl} name={author.name} size={avatarSize} />
      <div className="leading-tight">
        <Link href={`/author/${author.id}`} className="font-medium text-foreground hover:underline">
          {author.name}
        </Link>
        <div className="text-muted-foreground">
          {date && <time dateTime={toISO(date)}>{formatDate(date)}</time>}
          {date && readingTime ? <span className="px-1.5">·</span> : null}
          {readingTime ? <span>{readingTime} min read</span> : null}
        </div>
      </div>
    </div>
  );
}
