"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { title: string; href: string };
type Category = { name: string; slug: string };

export function DesktopNav({
  items,
  categories,
  className,
}: {
  items: Item[];
  categories: Category[];
  className?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const linkClass = (active: boolean) =>
    cn(
      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
      active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
    );

  return (
    <nav className={cn("items-center gap-0.5", className)}>
      {items.map((item) => {
        if (item.title === "Categories") {
          const active = pathname.startsWith("/category");
          return (
            <div key={item.href} ref={ref} className="relative">
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-haspopup="true"
                className={cn(linkClass(active), "inline-flex items-center gap-1")}
              >
                {item.title}
                <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
              </button>
              {open && (
                <div className="absolute left-0 top-full z-50 mt-1.5 w-[32rem] animate-scale-in rounded-xl border border-border bg-popover p-3 shadow-2xl">
                  {categories.length > 0 ? (
                    <div className="grid grid-cols-2 gap-0.5">
                      {categories.map((c) => (
                        <Link
                          key={c.slug}
                          href={`/category/${c.slug}`}
                          onClick={() => setOpen(false)}
                          className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                          {c.name}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                      No categories yet.
                    </p>
                  )}
                  <Link
                    href="/category"
                    onClick={() => setOpen(false)}
                    className="mt-2 block rounded-lg bg-accent/40 px-3 py-2 text-center text-sm font-medium text-primary transition-colors hover:bg-accent"
                  >
                    View all categories →
                  </Link>
                </div>
              )}
            </div>
          );
        }
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive(item.href) ? "page" : undefined}
            className={linkClass(isActive(item.href))}
          >
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
