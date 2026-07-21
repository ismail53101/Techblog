import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

// The shared header/footer read live settings (social links, categories) from
// the database. Render dynamically so those reflect the DB on every page —
// Railway's build can't reach the private DB, so static prerender would bake an
// empty/stale footer on otherwise-static pages (about, privacy, /rss, …).
export const dynamic = "force-dynamic";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
