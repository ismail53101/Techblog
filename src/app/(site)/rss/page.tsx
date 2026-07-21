import type { Metadata } from "next";
import { Rss } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/utils";
import { siteConfig } from "@/lib/constants";
import { PageHeader } from "@/components/blog/page-header";
import { RssSubscribe } from "@/components/blog/rss-subscribe";

export const metadata: Metadata = buildMetadata({
  title: "RSS Feed",
  description: `Subscribe to ${siteConfig.name} via RSS and never miss a new guide, review, or fix.`,
  path: "/rss",
});

const steps = [
  "Copy the feed URL below (or use a one-click button).",
  "Open your favourite RSS reader — Feedly, Inoreader, NetNewsWire, Reeder, and others all work.",
  "Add a new subscription and paste the URL. New articles will arrive automatically.",
];

export default function RssPage() {
  const feedUrl = absoluteUrl("/feed.xml");

  return (
    <>
      <PageHeader
        eyebrow="Stay updated"
        title="Subscribe via RSS"
        description={`Get every new ${siteConfig.name} article delivered straight to your RSS reader — no algorithm, no inbox clutter, no account required.`}
      />

      <div className="container grid max-w-4xl gap-8 py-12">
        <div className="flex items-start gap-4 rounded-2xl border border-border bg-muted/30 p-6">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#EE802F]/10 text-[#EE802F]">
            <Rss className="size-5" />
          </span>
          <div>
            <h2 className="font-heading text-lg font-semibold">What is RSS?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              RSS is a simple, open standard that lets you follow sites you love from one place. Your
              reader checks the feed for you and shows new posts as they’re published — you stay in
              control, and we never see your data.
            </p>
          </div>
        </div>

        <RssSubscribe feedUrl={feedUrl} />

        <div>
          <h2 className="font-heading text-lg font-semibold">How to subscribe</h2>
          <ol className="mt-3 space-y-3">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  );
}
