"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "sonner";
import { TiptapEditor } from "@/components/admin/editor/tiptap-editor";
import { ImageUpload } from "@/components/admin/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { slugify } from "@/lib/slugify";
import { siteConfig } from "@/lib/constants";

type Status = "DRAFT" | "SCHEDULED" | "PUBLISHED";

export type PostFormInitial = {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  coverImage?: string | null;
  coverImageAlt?: string | null;
  categoryId?: string;
  tags?: string[];
  status?: Status;
  featured?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  publishedAt?: string | null;
};

function toLocalInput(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function PostForm({
  categories,
  initial = {},
  mode,
}: {
  categories: { id: string; name: string }[];
  initial?: PostFormInitial;
  mode: "create" | "edit";
}) {
  const router = useRouter();

  const [title, setTitle] = React.useState(initial.title ?? "");
  const [slug, setSlug] = React.useState(initial.slug ?? "");
  const [slugEdited, setSlugEdited] = React.useState(Boolean(initial.slug));
  const [excerpt, setExcerpt] = React.useState(initial.excerpt ?? "");
  const [content, setContent] = React.useState(initial.content ?? "");
  const [coverImage, setCoverImage] = React.useState<string | null>(initial.coverImage ?? null);
  const [coverImageAlt, setCoverImageAlt] = React.useState(initial.coverImageAlt ?? "");
  const [categoryId, setCategoryId] = React.useState(initial.categoryId ?? categories[0]?.id ?? "");
  const [tags, setTags] = React.useState<string[]>(initial.tags ?? []);
  const [tagInput, setTagInput] = React.useState("");
  const [status, setStatus] = React.useState<Status>(initial.status ?? "DRAFT");
  const [featured, setFeatured] = React.useState(Boolean(initial.featured));
  const [metaTitle, setMetaTitle] = React.useState(initial.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = React.useState(initial.metaDescription ?? "");
  const [publishedAtLocal, setPublishedAtLocal] = React.useState(toLocalInput(initial.publishedAt));
  const [submitting, setSubmitting] = React.useState(false);

  function onTitleChange(v: string) {
    setTitle(v);
    if (!slugEdited) setSlug(slugify(v));
  }

  function addTag(raw: string) {
    const t = raw.trim().replace(/,$/, "");
    if (!t) return;
    if (!tags.some((x) => x.toLowerCase() === t.toLowerCase())) setTags([...tags, t]);
    setTagInput("");
  }

  async function submit(overrideStatus?: Status) {
    const finalStatus = overrideStatus ?? status;
    if (!title.trim() || !excerpt.trim() || !content.trim() || content === "<p></p>" || !categoryId) {
      toast.error("Add a title, excerpt, content, and category first.");
      return;
    }
    if (finalStatus === "SCHEDULED" && !publishedAtLocal) {
      toast.error("Pick a date and time to schedule the post.");
      return;
    }

    const payload = {
      title,
      slug: slug || undefined,
      excerpt,
      content,
      coverImage: coverImage || "",
      coverImageAlt: coverImageAlt || undefined,
      categoryId,
      tags,
      status: finalStatus,
      featured,
      metaTitle: metaTitle || undefined,
      metaDescription: metaDescription || undefined,
      publishedAt:
        finalStatus === "SCHEDULED" && publishedAtLocal
          ? new Date(publishedAtLocal).toISOString()
          : finalStatus === "DRAFT"
            ? null
            : undefined,
    };

    setSubmitting(true);
    try {
      const res = await fetch(mode === "create" ? "/api/posts" : `/api/posts/${initial.id}`, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus(finalStatus);
        toast.success(mode === "create" ? "Article created" : "Article saved");
        router.push("/admin/posts");
        router.refresh();
      } else {
        toast.error(data.error || "Could not save the article.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const primaryLabel =
    status === "PUBLISHED" ? "Publish" : status === "SCHEDULED" ? "Schedule" : "Save draft";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold">
          {mode === "create" ? "New article" : "Edit article"}
        </h1>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/posts"
            className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Link>
          {status !== "DRAFT" && (
            <Button variant="outline" disabled={submitting} onClick={() => submit("DRAFT")}>
              Save as draft
            </Button>
          )}
          <Button disabled={submitting} onClick={() => submit()}>
            {submitting ? <Spinner /> : primaryLabel}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        {/* Main column */}
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Your headline"
              className="text-lg"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlug(slugify(e.target.value));
                setSlugEdited(true);
              }}
              placeholder="url-friendly-slug"
            />
            <p className="text-xs text-muted-foreground">
              {siteConfig.url}/blog/<span className="text-foreground">{slug || "your-slug"}</span>
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              placeholder="A short summary shown in cards and search results."
            />
            <p className="text-xs text-muted-foreground">{excerpt.length}/320</p>
          </div>

          <div className="space-y-1.5">
            <Label>Content</Label>
            <TiptapEditor content={content} onChange={setContent} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <Card className="space-y-4 p-4">
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select id="status" value={status} onChange={(e) => setStatus(e.target.value as Status)}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="SCHEDULED">Scheduled</option>
              </Select>
            </div>

            {status === "SCHEDULED" && (
              <div className="space-y-1.5">
                <Label htmlFor="publishedAt">Publish at</Label>
                <Input
                  id="publishedAt"
                  type="datetime-local"
                  value={publishedAtLocal}
                  onChange={(e) => setPublishedAtLocal(e.target.value)}
                />
              </div>
            )}

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="size-4 rounded border-input accent-primary"
              />
              Feature on homepage
            </label>
          </Card>

          <Card className="space-y-3 p-4">
            <Label htmlFor="category">Category</Label>
            <Select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              {categories.length === 0 && <option value="">No categories</option>}
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Card>

          <Card className="space-y-3 p-4">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addTag(tagInput);
                }
              }}
              onBlur={() => tagInput && addTag(tagInput)}
              placeholder="Type a tag and press Enter"
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs"
                  >
                    {t}
                    <button
                      type="button"
                      aria-label={`Remove ${t}`}
                      onClick={() => setTags(tags.filter((x) => x !== t))}
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </Card>

          <Card className="space-y-3 p-4">
            <Label>Cover image</Label>
            <ImageUpload value={coverImage} onChange={setCoverImage} />
            <div className="space-y-1.5">
              <Label htmlFor="coverAlt" className="text-xs text-muted-foreground">
                Alt text
              </Label>
              <Input
                id="coverAlt"
                value={coverImageAlt}
                onChange={(e) => setCoverImageAlt(e.target.value)}
                placeholder="Describe the image"
              />
            </div>
          </Card>

          <Card className="space-y-3 p-4">
            <Label>SEO</Label>
            <div className="space-y-1.5">
              <Label htmlFor="metaTitle" className="text-xs text-muted-foreground">
                Meta title
              </Label>
              <Input
                id="metaTitle"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Defaults to the title"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="metaDescription" className="text-xs text-muted-foreground">
                Meta description
              </Label>
              <Textarea
                id="metaDescription"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={3}
                placeholder="Defaults to the excerpt"
              />
              <p className="text-xs text-muted-foreground">{metaDescription.length}/320</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
