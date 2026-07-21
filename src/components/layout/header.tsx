import { getAllCategories } from "@/lib/posts";
import { mainNav } from "@/lib/constants";
import { getSiteSettings } from "@/lib/settings";
import { Logo } from "./logo";
import { DesktopNav } from "./desktop-nav";
import { ThemeToggle } from "./theme-toggle";
import { SearchCommand } from "./search-command";
import { MobileNav } from "./mobile-nav";

export async function Header() {
  const [categories, { social }] = await Promise.all([getAllCategories(), getSiteSettings()]);
  const cats = categories.map((c) => ({ name: c.name, slug: c.slug }));

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center gap-4">
        <div className="flex items-center gap-5">
          <Logo />
          <DesktopNav items={mainNav} categories={cats} className="hidden md:flex" />
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <SearchCommand />
          <ThemeToggle />
          <MobileNav navItems={mainNav} categories={cats} social={social} />
        </div>
      </div>
    </header>
  );
}
