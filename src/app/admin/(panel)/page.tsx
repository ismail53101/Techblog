import Link from "next/link";
import {
  Eye,
  FileEdit,
  FileText,
  FolderTree,
  Mail,
  PlusCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

async function getStats() {
  try {
    const [total, published, drafts, scheduled, categories, subscribers, messages, views, recent] =
      await Promise.all([
        prisma.post.count(),
        prisma.post.count({ where: { status: "PUBLISHED" } }),
        prisma.post.count({ where: { status: "DRAFT" } }),
        prisma.post.count({ where: { status: "SCHEDULED" } }),
        prisma.category.count(),
        prisma.subscriber.count(),
        prisma.contactMessage.count({ where: { read: false } }),
        prisma.post.aggregate({ _sum: { views: true } }),
        prisma.post.findMany({
          orderBy: { updatedAt: "desc" },
          take: 6,
          select: { id: true, title: true, slug: true, status: true, views: true, updatedAt: true },
        }),
      ]);
    return {
      total,
      published,
      drafts,
      scheduled,
      categories,
      subscribers,
      messages,
      views: views._sum.views ?? 0,
      recent,
    };
  } catch {
    return null;
  }
}

const statusStyles: Record<string, string> = {
  PUBLISHED: "bg-green-500/15 text-green-600 dark:text-green-400",
  DRAFT: "bg-muted text-muted-foreground",
  SCHEDULED: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
};

export default async function DashboardPage() {
  const [user, stats] = await Promise.all([getCurrentUser(), getStats()]);

  const cards = [
    { label: "Total posts", value: stats?.total ?? 0, icon: FileText },
    { label: "Published", value: stats?.published ?? 0, icon: CheckCircle2 },
    { label: "Drafts", value: stats?.drafts ?? 0, icon: FileEdit },
    { label: "Scheduled", value: stats?.scheduled ?? 0, icon: Clock },
    { label: "Total views", value: (stats?.views ?? 0).toLocaleString(), icon: Eye },
    { label: "Categories", value: stats?.categories ?? 0, icon: FolderTree },
    { label: "Subscribers", value: stats?.subscribers ?? 0, icon: Mail },
    { label: "Unread messages", value: stats?.messages ?? 0, icon: Mail },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground">Here&rsquo;s what&rsquo;s happening on your blog.</p>
        </div>
        <Link href="/admin/posts/new" className={cn(buttonVariants())}>
          <PlusCircle className="size-4" />
          New article
        </Link>
      </div>

      {!stats && (
        <Card className="border-amber-500/40 bg-amber-500/5 p-4 text-sm">
          Couldn&rsquo;t reach the database. Check your <code>DATABASE_URL</code> and run migrations.
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label} className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{c.label}</span>
                <Icon className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-2 font-heading text-2xl font-bold">{c.value}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <div className="flex items-center justify-between border-b border-border p-5">
            <h2 className="font-heading font-semibold">Recent posts</h2>
            <Link href="/admin/posts" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {stats?.recent.length ? (
              stats.recent.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/posts/${p.id}/edit`}
                      className="line-clamp-1 font-medium hover:text-primary"
                    >
                      {p.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Updated {formatDate(p.updatedAt)} · {p.views.toLocaleString()} views
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                      statusStyles[p.status]
                    )}
                  >
                    {p.status.toLowerCase()}
                  </span>
                </div>
              ))
            ) : (
              <p className="p-6 text-sm text-muted-foreground">No posts yet. Create your first article.</p>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-semibold">Traffic</h2>
            <Badge variant="outline">Placeholder</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect Plausible, Umami, or Google Analytics to see real traffic here.
          </p>
          <div className="mt-5 flex h-40 items-end gap-1.5">
            {[35, 52, 40, 68, 60, 82, 72, 95, 80, 105, 90, 120].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-primary/25"
                style={{ height: `${(h / 120) * 100}%` }}
              />
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">Last 12 weeks (sample data)</p>
        </Card>
      </div>
    </div>
  );
}
