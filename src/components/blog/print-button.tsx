"use client";

import { Printer } from "lucide-react";
import { cn } from "@/lib/utils";

export function PrintButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      aria-label="Print article"
      title="Print article"
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <Printer className="size-4" />
    </button>
  );
}
