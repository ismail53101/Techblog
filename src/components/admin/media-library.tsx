"use client";

import * as React from "react";
import { Copy, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { uploadImageFile } from "@/lib/client-upload";

type Media = {
  id: string;
  publicId: string;
  url: string;
  width: number | null;
  height: number | null;
  createdAt: string;
};

export function MediaLibrary() {
  const [items, setItems] = React.useState<Media[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/media");
      const data = await res.json();
      setItems(data.media ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function upload(file: File) {
    setUploading(true);
    try {
      await uploadImageFile(file);
      toast.success("Uploaded");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL copied");
    } catch {
      toast.error("Couldn't copy");
    }
  }

  async function remove(m: Media) {
    if (!window.confirm("Delete this image? It will be removed from Cloudinary.")) return;
    const res = await fetch(`/api/media?publicId=${encodeURIComponent(m.publicId)}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Deleted");
      setItems((i) => i.filter((x) => x.id !== m.id));
    } else {
      toast.error("Could not delete");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold">Media library</h1>
        <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Spinner /> : <Upload className="size-4" />}
          Upload
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
            e.target.value = "";
          }}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 p-12 text-muted-foreground">
          <Spinner /> Loading…
        </div>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center text-sm text-muted-foreground">
          No media yet. Upload your first image.
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((m) => (
            <div key={m.id} className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt="" loading="lazy" className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-end justify-end gap-1 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                <button type="button" aria-label="Copy URL" onClick={() => copy(m.url)} className="rounded-md bg-white/15 p-1.5 text-white backdrop-blur hover:bg-white/25">
                  <Copy className="size-4" />
                </button>
                <button type="button" aria-label="Delete" onClick={() => remove(m)} className="rounded-md bg-white/15 p-1.5 text-white backdrop-blur hover:bg-red-500/70">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
