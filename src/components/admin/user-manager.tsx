"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { formatDate } from "@/lib/utils";

type Role = "ADMIN" | "EDITOR" | "AUTHOR";
type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
  createdAt: string;
  _count: { posts: number };
};

export function UserManager({ currentUserId }: { currentUserId: string }) {
  const [items, setItems] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [form, setForm] = React.useState({ name: "", email: "", password: "", role: "AUTHOR" as Role });
  const [adding, setAdding] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setItems(data.users ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success("User created");
        setForm({ name: "", email: "", password: "", role: "AUTHOR" });
        load();
      } else {
        toast.error(data.error || "Could not create user");
      }
    } finally {
      setAdding(false);
    }
  }

  async function changeRole(id: string, role: Role) {
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      toast.success("Role updated");
      setItems((u) => u.map((x) => (x.id === id ? { ...x, role } : x)));
    } else {
      toast.error(data.error || "Could not update role");
      load();
    }
  }

  async function remove(user: User) {
    if (!window.confirm(`Delete ${user.name}?`)) return;
    const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      toast.success("User deleted");
      setItems((u) => u.filter((x) => x.id !== user.id));
    } else {
      toast.error(data.error || "Could not delete user");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Users</h1>

      <Card className="p-4">
        <form onSubmit={add} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto_auto]">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" required />
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" required />
          <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password (min 8)" required minLength={8} />
          <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
            <option value="AUTHOR">Author</option>
            <option value="EDITOR">Editor</option>
            <option value="ADMIN">Admin</option>
          </Select>
          <Button type="submit" disabled={adding}>
            {adding ? <Spinner /> : <Plus className="size-4" />}
            Add
          </Button>
        </form>
      </Card>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-muted-foreground">
            <Spinner /> Loading…
          </div>
        ) : (
          <div className="divide-y divide-border">
            {items.map((user) => (
              <div key={user.id} className="flex items-center gap-4 p-4">
                <Avatar src={user.avatarUrl} name={user.name} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {user.name}
                    {user.id === currentUserId && (
                      <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email} · {user._count.posts} post{user._count.posts === 1 ? "" : "s"} · joined{" "}
                    {formatDate(user.createdAt)}
                  </p>
                </div>
                <Select
                  value={user.role}
                  onChange={(e) => changeRole(user.id, e.target.value as Role)}
                  disabled={user.id === currentUserId}
                  className="w-32"
                >
                  <option value="AUTHOR">Author</option>
                  <option value="EDITOR">Editor</option>
                  <option value="ADMIN">Admin</option>
                </Select>
                <button
                  type="button"
                  aria-label="Delete user"
                  disabled={user.id === currentUserId}
                  onClick={() => remove(user)}
                  className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-30"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
