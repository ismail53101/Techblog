import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  eyebrow,
  className,
  children,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("border-b border-border bg-muted/30", className)}>
      <div className="container py-12 md:py-16">
        <div className="max-w-3xl">
          {eyebrow && (
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>
          )}
          <h1 className="font-heading text-3xl font-bold tracking-tight text-balance md:text-4xl">
            {title}
          </h1>
          {description && <p className="mt-3 text-lg text-muted-foreground">{description}</p>}
          {children && <div className="mt-6">{children}</div>}
        </div>
      </div>
    </div>
  );
}
