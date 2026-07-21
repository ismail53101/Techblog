import Link from "next/link";
import { Zap } from "lucide-react";
import { siteConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} home`}
      className={cn("flex items-center gap-2 font-heading text-lg font-bold tracking-tight", className)}
    >
      <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Zap className="size-5" />
      </span>
      <span>{siteConfig.name}</span>
    </Link>
  );
}
