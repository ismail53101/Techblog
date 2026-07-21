import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="container flex h-16 items-center border-b border-border">
        <Logo />
      </div>
      <div className="container flex flex-1 flex-col items-center justify-center py-20 text-center">
        <p className="font-heading text-7xl font-bold text-primary">404</p>
        <h1 className="mt-4 font-heading text-2xl font-bold">Page not found</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          The page you&rsquo;re looking for doesn&rsquo;t exist or may have been moved.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className={cn(buttonVariants())}>
            Back to home
          </Link>
          <Link href="/blog" className={cn(buttonVariants({ variant: "outline" }))}>
            Browse articles
          </Link>
        </div>
      </div>
    </div>
  );
}
