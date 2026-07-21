import type { Metadata } from "next";
import { siteConfig } from "@/lib/constants";
import { absoluteUrl } from "@/lib/utils";

type BuildMetaOptions = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  tags?: string[];
  noIndex?: boolean;
};

function resolveImage(image?: string, title?: string): string {
  if (image) return image.startsWith("http") ? image : absoluteUrl(image);
  const t = encodeURIComponent(title || siteConfig.name);
  return absoluteUrl(`/api/og?title=${t}`);
}

/** Build a complete Next.js Metadata object with canonical, OG, and Twitter tags. */
export function buildMetadata(opts: BuildMetaOptions = {}): Metadata {
  const description = opts.description || siteConfig.description;
  const path = opts.path || "/";
  const url = absoluteUrl(path);
  const image = resolveImage(opts.image, opts.title);
  const isArticle = opts.type === "article";

  return {
    title: opts.title ? opts.title : { absolute: siteConfig.name },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: opts.type || "website",
      url,
      title: opts.title || siteConfig.name,
      description,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      images: [{ url: image, width: 1200, height: 630, alt: opts.title || siteConfig.name }],
      ...(isArticle
        ? {
            publishedTime: opts.publishedTime,
            modifiedTime: opts.modifiedTime,
            authors: opts.authors,
            tags: opts.tags,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title || siteConfig.name,
      description,
      images: [image],
      creator: siteConfig.twitter,
    },
    robots: opts.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, "max-image-preview": "large" },
  };
}

// ----------------------------------------------------------------------------
// JSON-LD structured data builders (Schema.org)
// ----------------------------------------------------------------------------

export function jsonLdWebSite() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function jsonLdOrganization() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: absoluteUrl("/icon.png"),
    sameAs: [siteConfig.socials.twitter, siteConfig.socials.github, siteConfig.socials.youtube],
  };
}

type ArticleLd = {
  title: string;
  description: string;
  slug: string;
  image?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  authorName: string;
  authorUrl?: string;
  tags?: string[];
};

export function jsonLdArticle(a: ArticleLd) {
  const url = absoluteUrl(`/blog/${a.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: a.title,
    description: a.description,
    image: a.image ? [a.image] : [resolveImage(undefined, a.title)],
    datePublished: a.publishedAt || undefined,
    dateModified: a.updatedAt || a.publishedAt || undefined,
    author: {
      "@type": "Person",
      name: a.authorName,
      url: a.authorUrl,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: { "@type": "ImageObject", url: absoluteUrl("/icon.png") },
    },
    keywords: a.tags?.join(", "),
    url,
  };
}

export function jsonLdBreadcrumb(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : absoluteUrl(item.url),
    })),
  };
}

export function jsonLdFaq(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: { "@type": "Answer", text: i.answer },
    })),
  };
}
