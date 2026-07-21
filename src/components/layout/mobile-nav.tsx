"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { NavLinks } from "./nav-links";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";

type Item = { title: string; href: string };
type Category = { name: string; slug: string };

export function MobileNav({
  navItems,
  categories,
}: {
  navItems: Item[];
  categories: Category[];
}) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <Button variant="ghost" size="icon" aria-label="Open menu" onClick={() => setOpen(true)}>
        <Menu className="size-5" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-[85%] max-w-sm flex-col bg-background shadow-xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <Logo />
              <Button variant="ghost" size="icon" aria-label="Close menu" onClick={() => setOpen(false)}>
                <X className="size-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4">
              <NavLinks
                items={navItems}
                className="flex-col items-stretch gap-0.5"
                onNavigate={() => setOpen(false)}
              />

              <p className="px-3 pb-2 pt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Categories
              </p>
              <div className="flex flex-col gap-0.5">
                {categories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/category/${c.slug}`}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
