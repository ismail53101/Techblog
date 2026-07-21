import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/blog/page-header";

export const metadata: Metadata = buildMetadata({
  title: "Disclaimer",
  description: `Disclaimer for ${siteConfig.name}.`,
  path: "/disclaimer",
});

export default function DisclaimerPage() {
  return (
    <>
      <PageHeader title="Disclaimer" description={`Last updated ${formatDate(new Date())}`} />
      <div className="container py-12">
        <article className="prose prose-neutral max-w-3xl dark:prose-invert">
          <p>
            The information provided by {siteConfig.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or
            &ldquo;our&rdquo;) on this website is for general informational and educational purposes
            only. This document is a template and should be reviewed by a legal professional before you
            rely on it.
          </p>
          <h2>No professional advice</h2>
          <p>
            Our content — including guides, tutorials, reviews, and troubleshooting steps — does not
            constitute professional advice. Technology, software, and security landscapes change
            quickly; always verify critical steps against official documentation before acting.
          </p>
          <h2>Follow instructions at your own risk</h2>
          <p>
            You are responsible for backing up your data and understanding the changes you make to your
            devices, accounts, or systems. {siteConfig.name} is not liable for any loss or damage
            resulting from following our guides.
          </p>
          <h2>Accuracy &amp; availability</h2>
          <p>
            We strive for accuracy but make no warranties about the completeness, reliability, or
            timeliness of the content. Product prices, features, and availability may change after
            publication.
          </p>
          <h2>External links</h2>
          <p>
            Our site may contain links to third-party websites. We have no control over, and assume no
            responsibility for, the content or practices of any third-party sites.
          </p>
          <h2>Affiliate &amp; advertising disclosure</h2>
          <p>
            Some articles may contain affiliate links or sponsored content. If you purchase through
            these links, we may earn a commission at no additional cost to you. This never influences
            our editorial recommendations.
          </p>
          <h2>Contact</h2>
          <p>
            Questions about this disclaimer? Reach us through our <a href="/contact">contact page</a>.
          </p>
        </article>
      </div>
    </>
  );
}
