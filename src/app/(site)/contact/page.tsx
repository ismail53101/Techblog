import type { Metadata } from "next";
import { Mail, MessageSquare, Twitter } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/constants";
import { PageHeader } from "@/components/blog/page-header";
import { ContactForm } from "@/components/blog/contact-form";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description: `Get in touch with the ${siteConfig.name} team.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Say hello"
        title="Contact us"
        description="Questions, feedback, tips, or partnership ideas — we read everything."
      />
      <div className="container grid gap-12 py-12 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <ContactForm />
        </div>
        <aside className="space-y-6">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Mail className="size-5" />
            </div>
            <div>
              <h3 className="font-medium">Email</h3>
              <p className="text-sm text-muted-foreground">hello@example.com</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Twitter className="size-5" />
            </div>
            <div>
              <h3 className="font-medium">Social</h3>
              <p className="text-sm text-muted-foreground">Reach out {siteConfig.twitter} on Twitter/X.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <MessageSquare className="size-5" />
            </div>
            <div>
              <h3 className="font-medium">Response time</h3>
              <p className="text-sm text-muted-foreground">We typically reply within 1–2 business days.</p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
