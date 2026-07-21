import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function CategoryBadge({
  category,
  className,
}: {
  category: { name: string; slug: string };
  className?: string;
}) {
  return (
    <Link href={`/category/${category.slug}`} className="inline-block">
      <Badge variant="accent" className={cn("transition-opacity hover:opacity-80", className)}>
        {category.name}
      </Badge>
    </Link>
  );
}
