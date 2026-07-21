"use client";

import * as React from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function RssSubscribe({ feedUrl }: { feedUrl: string }) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopied(true);
      toast.success("Feed URL copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn’t copy automatically — select the URL and copy it manually.");
    }
  }

  const feedly = `https://feedly.com/i/subscription/feed/${encodeURIComponent(feedUrl)}`;
  const inoreader = `https://www.inoreader.com/?add_feed=${encodeURIComponent(feedUrl)}`;

  const readerBtn =
    "inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <h2 className="font-heading text-lg font-semibold">Your feed URL</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Paste this address into any RSS reader to get new articles automatically.
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <code className="min-w-0 flex-1 truncate rounded-lg border border-border bg-muted px-4 py-2.5 text-sm">
          {feedUrl}
        </code>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy feed URL to clipboard"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-sm font-medium">Or subscribe with one click</p>
        <div className="flex flex-wrap gap-2">
          <a href={feedly} target="_blank" rel="noopener noreferrer" className={readerBtn}>
            Feedly <ExternalLink className="size-3.5 opacity-60" />
          </a>
          <a href={inoreader} target="_blank" rel="noopener noreferrer" className={readerBtn}>
            Inoreader <ExternalLink className="size-3.5 opacity-60" />
          </a>
          <a href={feedUrl} target="_blank" rel="noopener noreferrer" className={cn(readerBtn, "text-muted-foreground")}>
            View raw feed <ExternalLink className="size-3.5 opacity-60" />
          </a>
        </div>
      </div>
    </div>
  );
}
