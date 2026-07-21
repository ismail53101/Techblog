"use client";

import * as React from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { uploadImageFile } from "@/lib/client-upload";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function ImageUpload({
  value,
  onChange,
  className,
}: {
  value?: string | null;
  onChange: (url: string | null) => void;
  className?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleFile(file: File) {
    setLoading(true);
    try {
      const asset = await uploadImageFile(file);
      onChange(asset.url);
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        <div className="group relative aspect-[16/9] overflow-hidden rounded-lg border border-border">
          <Image src={value} alt="Cover preview" fill sizes="400px" className="object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-2 top-2 rounded-md bg-black/60 p-1.5 text-white opacity-0 transition group-hover:opacity-100"
            aria-label="Remove image"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          {loading ? <Loader2 className="size-6 animate-spin" /> : <ImagePlus className="size-6" />}
          <span className="text-sm">{loading ? "Uploading…" : "Upload cover image"}</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      <div className="flex items-center gap-2">
        <Input
          type="url"
          placeholder="…or paste an image URL"
          defaultValue={value?.startsWith("http") ? value : ""}
          onBlur={(e) => {
            const v = e.target.value.trim();
            if (v) onChange(v);
          }}
        />
      </div>
    </div>
  );
}
