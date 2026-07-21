"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Code,
  Download,
  FileText,
  Globe,
  Hash,
  Home,
  Info,
  LayoutGrid,
  Lock,
  type LucideIcon,
  Mail,
  Menu,
  Monitor,
  Newspaper,
  Package,
  PenTool,
  Phone,
  Scale,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  TrendingUp,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

type Category = { name: string; slug: string };
type NavLink = { title: string; href: string; Icon: LucideIcon; exact?: boolean };

const PRIMARY_LINKS: NavLink[] = [
  { title: "Home", href: "/", Icon: Home, exact: true },
  { title: "Latest Articles", href: "/blog", Icon: Newspaper },
];

const PAGE_LINKS: NavLink[] = [
  { title: "About Us", href: "/about", Icon: Info },
  { title: "Contact Us", href: "/contact", Icon: Mail },
];

const LEGAL_LINKS: NavLink[] = [
  { title: "Privacy Policy", href: "/privacy", Icon: Lock },
  { title: "Terms & Conditions", href: "/terms", Icon: FileText },
  { title: "Disclaimer", href: "/disclaimer", Icon: Scale },
];

/** Preferred display order + a modern icon for each known category (matched by slug). */
const CATEGORY_META: { slug: string; Icon: LucideIcon }[] = [
  { slug: "ai-tools", Icon: Sparkles },
  { slug: "windows", Icon: Monitor },
  { slug: "android", Icon: Smartphone },
  { slug: "iphone-ios", Icon: Phone },
  { slug: "software", Icon: Package },
  { slug: "cybersecurity", Icon: ShieldCheck },
  { slug: "troubleshooting", Icon: Wrench },
  { slug: "reviews", Icon: Star },
  { slug: "productivity", Icon: Zap },
  { slug: "downloads", Icon: Download },
  { slug: "blogging", Icon: PenTool },
  { slug: "seo", Icon: TrendingUp },
  { slug: "web-development", Icon: Code },
  { slug: "internet-tips", Icon: Globe },
  { slug: "how-to-guides", Icon: BookOpen },
];
const CATEGORY_ORDER = new Map(CATEGORY_META.map((c, i) => [c.slug, i]));
const CATEGORY_ICON = new Map(CATEGORY_META.map((c) => [c.slug, c.Icon]));

export function MobileNav({ categories }: { categories: Category[] }) {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [catOpen, setCatOpen] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  // Close the drawer on route change.
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Auto-expand Categories when viewing a category page.
  React.useEffect(() => {
    if (pathname?.startsWith("/category")) setCatOpen(true);
  }, [pathname]);

  // Lock body scroll while the drawer is open.
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const sortedCategories = React.useMemo(
    () =>
      [...categories].sort((a, b) => {
        const ai = CATEGORY_ORDER.has(a.slug) ? (CATEGORY_ORDER.get(a.slug) as number) : 999;
        const bi = CATEGORY_ORDER.has(b.slug) ? (CATEGORY_ORDER.get(b.slug) as number) : 999;
        return ai !== bi ? ai - bi : a.name.localeCompare(b.name);
      }),
    [categories]
  );

  const rowCls = (active: boolean) =>
    cn(
      "group flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-[15px] font-medium transition-colors",
      active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-accent"
    );
  const iconCls = (active: boolean) =>
    cn(
      "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
      active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground group-hover:text-foreground"
    );

  const renderLink = ({ title, href, Icon, exact }: NavLink) => {
    const active = isActive(href, exact);
    return (
      <Link key={href} href={href} onClick={close} aria-current={active ? "page" : undefined} className={rowCls(active)}>
        <span className={iconCls(active)}>
          <Icon className="size-[18px]" />
        </span>
        <span className="flex-1">{title}</span>
        <ChevronRight className="size-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" />
      </Link>
    );
  };

  const categoriesActive = pathname === "/category" || pathname.startsWith("/category/");

  const drawer = (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden",
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
          "fixed inset-y-0 right-0 z-[70] flex w-[88%] max-w-sm flex-col bg-background shadow-2xl transition-transform duration-300 ease-out md:hidden",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3.5">
          <Logo />
          <button
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="inline-flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Search + theme toggle — pinned at the top */}
        <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3">
          <Link
            href="/search"
            onClick={close}
            className="flex flex-1 items-center gap-2.5 rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Search className="size-4" />
            Search articles…
          </Link>
          <ThemeToggle />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-4" aria-label="Primary">
          <div className="flex flex-col gap-1">
            {PRIMARY_LINKS.map(renderLink)}

            {/* Categories (expandable) */}
            <div>
              <button
                type="button"
                onClick={() => setCatOpen((v) => !v)}
                aria-expanded={catOpen}
                aria-controls="mobile-categories-panel"
                className={rowCls(categoriesActive) + " w-full"}
              >
                <span className={iconCls(categoriesActive)}>
                  <LayoutGrid className="size-[18px]" />
                </span>
                <span className="flex-1 text-left">Categories</span>
                {sortedCategories.length > 0 && (
                  <span className="mr-1 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                    {sortedCategories.length}
                  </span>
                )}
                <ChevronDown
                  className={cn(
                    "size-4 text-muted-foreground transition-transform duration-300 motion-reduce:transition-none",
                    catOpen && "rotate-180"
                  )}
                />
              </button>

              {/* Smooth expand/collapse via animated grid rows */}
              <div
                id="mobile-categories-panel"
                aria-hidden={!catOpen}
                className={cn(
                  "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
                  catOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="overflow-hidden">
                  <div className="ml-5 mt-1 flex flex-col gap-0.5 border-l border-border pl-3">
                    {sortedCategories.length > 0 ? (
                      sortedCategories.map((c) => {
                        const Icon = CATEGORY_ICON.get(c.slug) ?? Hash;
                        const active = pathname === `/category/${c.slug}`;
                        return (
                          <Link
                            key={c.slug}
                            href={`/category/${c.slug}`}
                            onClick={close}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                              active
                                ? "bg-primary/10 font-medium text-primary"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            )}
                          >
                            <Icon className={cn("size-4 shrink-0", active ? "text-primary" : "opacity-70")} />
                            {c.name}
                          </Link>
                        );
                      })
                    ) : (
                      <p className="px-3 py-2 text-sm text-muted-foreground">No categories yet.</p>
                    )}

                    <Link
                      href="/category"
                      onClick={close}
                      className="mt-0.5 flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-accent"
                    >
                      View all categories <ChevronRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {PAGE_LINKS.map(renderLink)}
          </div>

          {/* Legal */}
          <div className="my-3 border-t border-border" />
          <div className="flex flex-col gap-1">{LEGAL_LINKS.map(renderLink)}</div>
        </nav>
      </div>
    </>
  );

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex size-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent"
      >
        <Menu className="size-5" />
      </button>

      {/* Rendered in a portal on <body> so the header's backdrop-filter doesn't
          become the containing block for these fixed-position elements. */}
      {mounted && createPortal(drawer, document.body)}
    </div>
  );
}
