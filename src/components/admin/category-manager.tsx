"use client";

import * as React from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

type Category = { id: string; name: string; slug: string; description: string | null; count: number };

export function CategoryManager() {
  const [items, setItems] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [adding, setAdding] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editDesc, setEditDesc] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setItems(data.categories ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success("Category added");
        setName("");
        setDescription("");
        load();
      } else {
        toast.error(data.error || "Could not add category");
      }
    } finally {
      setAdding(false);
    }
  }

  async function saveEdit(id: string) {
    const res = await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, description: editDesc }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      toast.success("Category updated");
      setEditingId(null);
      load();
    } else {
      toast.error(data.error || "Could not update category");
    }
  }

  async function remove(cat: Category) {
    if (!window.confirm(`Delete “${cat.name}”?`)) return;
    const res = await fetch(`/api/categories/${cat.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      toast.success("Category deleted");
      setItems((i) => i.filter((c) => c.id !== cat.id));
    } else {
      toast.error(data.error || "Could not delete category");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Categories</h1>

      <Card className="p-4">
        <form onSubmit={add} className="grid gap-3 sm:grid-cols-[1fr_1.5fr_auto]">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" />
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description (optional)" />
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
        ) : items.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">No categories yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {items.map((cat) => (
              <div key={cat.id} className="flex items-center gap-4 p-4">
                {editingId === cat.id ? (
                  <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                    <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Description" />
                  </div>
                ) : (
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{cat.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      /{cat.slug} · {cat.count} post{cat.count === 1 ? "" : "s"}
                      {cat.description ? ` · ${cat.description}` : ""}
                    </p>
                  </div>
                )}
                <div className="flex shrink-0 items-center gap-1">
                  {editingId === cat.id ? (
                    <>
                      <button type="button" aria-label="Save" onClick={() => saveEdit(cat.id)} className="rounded-md p-2 text-primary hover:bg-accent">
                        <Check className="size-4" />
                      </button>
                      <button type="button" aria-label="Cancel" onClick={() => setEditingId(null)} className="rounded-md p-2 text-muted-foreground hover:bg-accent">
                        <X className="size-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        aria-label="Edit"
                        onClick={() => {
                          setEditingId(cat.id);
                          setEditName(cat.name);
                          setEditDesc(cat.description ?? "");
                        }}
                        className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button type="button" aria-label="Delete" onClick={() => remove(cat)} className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="size-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
