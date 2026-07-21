"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  ExternalLink,
  FileText,
  FolderTree,
  Hash,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  X,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const NAV = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { title: "Posts", href: "/admin/posts", icon: FileText },
  { title: "Categories", href: "/admin/categories", icon: FolderTree },
  { title: "Tags", href: "/admin/tags", icon: Hash },
  { title: "Media", href: "/admin/media", icon: ImageIcon },
  { title: "Users", href: "/admin/users", icon: Users, adminOnly: true },
];

export function AdminNav({
  user,
}: {
  user: { name?: string | null; email?: string | null; role: string };
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const items = NAV.filter((i) => !i.adminOnly || user.role === "ADMIN");

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  const inner = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-border px-5">
        <Logo />
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-1 border-t border-border p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ExternalLink className="size-4" />
          View site
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
        <div className="flex items-center gap-3 px-3 pt-2">
          <Avatar name={user.name || user.email || "U"} size={32} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.name || "User"}</p>
            <p className="truncate text-xs capitalize text-muted-foreground">
              {user.role.toLowerCase()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-card lg:block">
        {inner}
      </aside>

      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <Logo />
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="rounded-md p-2 hover:bg-accent"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 bg-card shadow-xl">
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute right-2 top-4 rounded-md p-2 hover:bg-accent"
            >
              <X className="size-5" />
            </button>
            {inner}
          </div>
        </div>
      )}
    </>
  );
}
