"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Hash, Menu, Search, X } from "lucide-react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { SocialLinks } from "./social-links";
import { NewsletterForm } from "@/components/blog/newsletter-form";
import { legalNav } from "@/lib/constants";
import type { SocialLinksSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

type Item = { title: string; href: string };
type Category = { name: string; slug: string };

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pb-2 pt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  );
}

export function MobileNav({
  navItems,
  categories,
  social,
}: {
  navItems: Item[];
  categories: Category[];
  social: SocialLinksSettings;
}) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  // Close automatically on route change.
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);
  const mainItems = navItems.filter((i) => i.title !== "Categories");

  const rowLink =
    "flex items-center justify-between rounded-lg px-3 py-2.5 text-[15px] font-medium text-foreground transition-colors hover:bg-accent";

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="inline-flex size-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent"
      >
        <Menu className="size-5" />
      </button>

      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={close}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-[86%] max-w-sm flex-col bg-background shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <Logo />
          <button
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="inline-flex size-10 items-center justify-center rounded-lg transition-colors hover:bg-accent"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-4">
          <Link
            href="/search"
            onClick={close}
            className="mb-2 flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-accent"
          >
            <Search className="size-4" />
            Search articles…
          </Link>

          <div className="flex flex-col gap-0.5">
            {mainItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={close} className={rowLink}>
                <span>{item.title}</span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            ))}
          </div>

          <SectionLabel>Categories</SectionLabel>
          {categories.length > 0 ? (
            <div className="grid grid-cols-2 gap-0.5">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  onClick={close}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Hash className="size-3.5 opacity-60" />
                  {c.name}
                </Link>
              ))}
            </div>
          ) : (
            <p className="px-3 py-2 text-sm text-muted-foreground">No categories yet.</p>
          )}
          <Link
            href="/category"
            onClick={close}
            className="mt-1 flex items-center gap-1 px-3 py-2 text-sm font-medium text-primary"
          >
            View all categories <ChevronRight className="size-4" />
          </Link>

          <SectionLabel>More</SectionLabel>
          <div className="flex flex-col gap-0.5">
            {legalNav.map((item) => (
              <Link key={item.href} href={item.href} onClick={close} className={rowLink}>
                <span>{item.title}</span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            ))}
          </div>

          <SectionLabel>Appearance</SectionLabel>
          <div className="flex items-center justify-between rounded-lg px-3">
            <span className="text-sm text-muted-foreground">Dark / light mode</span>
            <ThemeToggle />
          </div>

          <div className="mt-6 rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-semibold">Get the newsletter</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Weekly fixes &amp; guides. No spam.</p>
            <NewsletterForm className="mt-3" />
          </div>
        </div>

        <div className="border-t border-border px-4 py-4">
          <SocialLinks social={social} />
        </div>
      </div>
    </div>
  );
}
