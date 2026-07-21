import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  eyebrow,
  href,
  linkLabel = "View all",
  Icon,
  className,
}: {
  title: string;
  eyebrow?: string;
  href?: string;
  linkLabel?: string;
  Icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 flex items-end justify-between gap-4", className)}>
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>
        )}
        <h2 className="flex items-center gap-2 font-heading text-2xl font-bold tracking-tight md:text-3xl">
          {Icon && (
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" />
            </span>
          )}
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {linkLabel}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
