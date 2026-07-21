import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { siteConfig, defaultCategories } from "@/lib/constants";
import { PageHeader } from "@/components/blog/page-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description: `Learn about ${siteConfig.name} and what we cover.`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title={`About ${siteConfig.name}`}
        description={siteConfig.description}
      />
      <div className="container grid gap-12 py-12 lg:grid-cols-[1.6fr_1fr]">
        <article className="prose prose-neutral max-w-none dark:prose-invert">
          <h2>Our mission</h2>
          <p>
            {siteConfig.name} exists to make technology approachable. We publish clear, honest, and
            genuinely useful guides, reviews, and how-tos — the kind of articles we wish we&rsquo;d had
            when we were stuck. No fluff, no filler, and no chasing hype for its own sake.
          </p>
          <h2>What we cover</h2>
          <p>
            From AI tools and cybersecurity to Windows fixes and web development, our coverage spans the
            topics that matter to curious, capable people who want to get more out of their devices and
            software.
          </p>
          <h2>How we work</h2>
          <p>
            Every article is written by a real person, edited for accuracy, and updated as things change.
            When we recommend a product, we explain the trade-offs. When we publish a fix, we&rsquo;ve
            tested it. Reader trust is the only metric that matters.
          </p>
          <h2>Get in touch</h2>
          <p>
            Have a tip, a correction, or an idea for a story? We&rsquo;d love to hear from you on our{" "}
            <Link href="/contact">contact page</Link>.
          </p>
        </article>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-heading font-semibold">Topics we cover</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {defaultCategories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-heading font-semibold">Start reading</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Jump into our latest guides and reviews.
            </p>
            <Link href="/blog" className={cn(buttonVariants(), "mt-4 w-full")}>
              Browse the blog
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
