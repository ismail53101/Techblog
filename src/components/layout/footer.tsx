import Link from "next/link";
import { getAllCategories } from "@/lib/posts";
import { footerNav, siteConfig } from "@/lib/constants";
import { getSiteSettings } from "@/lib/settings";
import { Logo } from "./logo";
import { SocialLinks } from "./social-links";
import { NewsletterForm } from "@/components/blog/newsletter-form";

export async function Footer() {
  const [categories, { social }] = await Promise.all([
    getAllCategories().then((c) => c.slice(0, 8)),
    getSiteSettings(),
  ]);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          <div className="space-y-4 lg:col-span-2">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">{siteConfig.description}</p>
            <SocialLinks social={social} className="-ml-2" />
          </div>

          {footerNav.map((col) => (
            <div key={col.title}>
              <h3 className="mb-3 text-sm font-semibold">{col.title}</h3>
              <ul className="space-y-2">
                {col.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground">
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="mb-3 text-sm font-semibold">Categories</h3>
            <ul className="space-y-2">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/category/${c.slug}`} className="text-sm text-muted-foreground hover:text-foreground">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="grid items-center gap-4 sm:grid-cols-[1.2fr_1fr]">
            <div>
              <h3 className="font-heading text-lg font-semibold">Get the weekly digest</h3>
              <p className="text-sm text-muted-foreground">
                The best new guides, reviews, and fixes — straight to your inbox. No spam.
              </p>
            </div>
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>
            © {year} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/disclaimer" className="hover:text-foreground">Disclaimer</Link>
            <Link href="/contact" className="hover:text-foreground">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
