import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/blog/page-header";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service",
  description: `The terms that govern your use of ${siteConfig.name}.`,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <PageHeader title="Terms of Service" description={`Last updated ${formatDate(new Date())}`} />
      <div className="container py-12">
        <article className="prose prose-neutral max-w-3xl dark:prose-invert">
          <p>
            These Terms of Service (&ldquo;Terms&rdquo;) govern your use of {siteConfig.name}. By using the
            site, you agree to these Terms. This document is a template and should be reviewed by a legal
            professional before you rely on it.
          </p>
          <h2>Use of the site</h2>
          <p>
            You may access and read our content for personal, non-commercial use. You agree not to misuse
            the site, attempt to disrupt it, or access it in a way that violates any law.
          </p>
          <h2>Intellectual property</h2>
          <p>
            All content published on {siteConfig.name}, unless otherwise noted, is owned by us or our
            contributors and is protected by applicable copyright laws. You may share links freely, but you
            may not republish full articles without permission.
          </p>
          <h2>Disclaimer</h2>
          <p>
            Our content is provided &ldquo;as is&rdquo; for informational purposes. While we strive for
            accuracy, we make no warranties about completeness or reliability. Follow technical instructions
            at your own risk.
          </p>
          <h2>Limitation of liability</h2>
          <p>
            To the fullest extent permitted by law, {siteConfig.name} shall not be liable for any damages
            arising from your use of, or inability to use, the site.
          </p>
          <h2>Changes to these Terms</h2>
          <p>
            We may update these Terms from time to time. Continued use of the site after changes constitutes
            acceptance of the revised Terms.
          </p>
          <h2>Contact</h2>
          <p>
            Questions about these Terms? Reach us through our <a href="/contact">contact page</a>.
          </p>
        </article>
      </div>
    </>
  );
}
