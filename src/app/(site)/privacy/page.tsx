import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/blog/page-header";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: `How ${siteConfig.name} collects, uses, and protects your data.`,
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <PageHeader title="Privacy Policy" description={`Last updated ${formatDate(new Date())}`} />
      <div className="container py-12">
        <article className="prose prose-neutral max-w-3xl dark:prose-invert">
          <p>
            This Privacy Policy explains how {siteConfig.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) handles
            information when you visit our website. This document is a template and should be reviewed by a
            legal professional before you rely on it.
          </p>
          <h2>Information we collect</h2>
          <ul>
            <li>
              <strong>Newsletter data.</strong> If you subscribe, we store your email address to send you
              updates. You can unsubscribe at any time.
            </li>
            <li>
              <strong>Contact submissions.</strong> Messages you send through our contact form, including
              your name and email, so we can respond.
            </li>
            <li>
              <strong>Usage data.</strong> Aggregate, non-identifying analytics such as page views to
              understand what content is useful.
            </li>
            <li>
              <strong>Local storage.</strong> Your theme preference and saved bookmarks are stored in your
              browser and never leave your device.
            </li>
          </ul>
          <h2>How we use information</h2>
          <p>
            We use the information above to operate the site, deliver the newsletter, respond to enquiries,
            and improve our content. We do not sell your personal information.
          </p>
          <h2>Cookies and local storage</h2>
          <p>
            We use browser local storage for your preferences. Any analytics or advertising providers you
            add may set their own cookies, governed by their respective policies.
          </p>
          <h2>Third-party services</h2>
          <p>
            We may rely on third-party providers (for example, image hosting and email delivery). These
            providers process data on our behalf under their own terms.
          </p>
          <h2>Your rights</h2>
          <p>
            Depending on your jurisdiction, you may have rights to access, correct, or delete your personal
            data. Contact us to exercise these rights.
          </p>
          <h2>Contact</h2>
          <p>
            Questions about this policy? Reach us through our{" "}
            <a href="/contact">contact page</a>.
          </p>
        </article>
      </div>
    </>
  );
}
