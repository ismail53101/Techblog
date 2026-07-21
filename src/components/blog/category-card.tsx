import Link from "next/link";
import { getCategoryIcon } from "@/lib/category-icons";
import type { CategoryWithCount } from "@/lib/posts";

export function CategoryCard({ category }: { category: CategoryWithCount }) {
  const Icon = getCategoryIcon(category.slug);
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="size-6" />
      </span>
      <div className="min-w-0">
        <h3 className="truncate font-heading font-semibold leading-tight transition-colors group-hover:text-primary">
          {category.name}
        </h3>
        <p className="text-xs text-muted-foreground">
          {category.count} article{category.count === 1 ? "" : "s"}
        </p>
      </div>
    </Link>
  );
}
