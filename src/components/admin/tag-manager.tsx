"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

type Tag = { id: string; name: string; slug: string; count: number };

export function TagManager() {
  const [items, setItems] = React.useState<Tag[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [name, setName] = React.useState("");
  const [adding, setAdding] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tags");
      const data = await res.json();
      setItems(data.tags ?? []);
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
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success("Tag added");
        setName("");
        load();
      } else {
        toast.error(data.error || "Could not add tag");
      }
    } finally {
      setAdding(false);
    }
  }

  async function remove(tag: Tag) {
    if (!window.confirm(`Delete tag “${tag.name}”?`)) return;
    const res = await fetch(`/api/tags/${tag.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      toast.success("Tag deleted");
      setItems((i) => i.filter((t) => t.id !== tag.id));
    } else {
      toast.error(data.error || "Could not delete tag");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Tags</h1>

      <Card className="p-4">
        <form onSubmit={add} className="flex gap-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New tag name" />
          <Button type="submit" disabled={adding} className="shrink-0">
            {adding ? <Spinner /> : <Plus className="size-4" />}
            Add
          </Button>
        </form>
      </Card>

      <Card className="p-4">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
            <Spinner /> Loading…
          </div>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No tags yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {items.map((tag) => (
              <span key={tag.id} className="inline-flex items-center gap-2 rounded-full border border-border py-1 pl-3 pr-1 text-sm">
                {tag.name}
                <span className="text-xs text-muted-foreground">{tag.count}</span>
                <button
                  type="button"
                  aria-label={`Delete ${tag.name}`}
                  onClick={() => remove(tag)}
                  className="rounded-full p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
