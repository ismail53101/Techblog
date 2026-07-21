"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { SOCIAL_PLATFORMS } from "@/lib/social";

type SocialValues = {
  github: string;
  youtube: string;
  twitter: string;
  facebook: string;
  linkedin: string;
};

export function SocialLinksForm({ initial }: { initial: SocialValues }) {
  const [values, setValues] = React.useState<SocialValues>(initial);
  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<Partial<Record<keyof SocialValues, string>>>({});

  function update(key: keyof SocialValues, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof SocialValues, string>> = {};
    for (const p of SOCIAL_PLATFORMS) {
      const val = values[p.key].trim();
      if (val && !/^https?:\/\/\S+\.\S+/i.test(val)) {
        next[p.key] = "Enter a full URL (https://…) or leave it blank.";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted URLs.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/settings/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) toast.success("Social links saved. They’ll update across the site within a moment.");
      else toast.error(data.error || "Could not save social links");
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Social Links</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add the URLs to your profiles. Any field you leave blank is automatically hidden from the
          footer and menu — so only the icons you configure will show.
        </p>
      </div>

      <form onSubmit={save}>
        <Card className="space-y-5 p-6">
          {SOCIAL_PLATFORMS.map((p) => (
            <div key={p.key} className="space-y-1.5">
              <Label htmlFor={`social-${p.key}`}>
                {p.label}
                {p.optional && <span className="ml-2 text-xs font-normal text-muted-foreground">optional</span>}
              </Label>
              <Input
                id={`social-${p.key}`}
                type="url"
                inputMode="url"
                value={values[p.key]}
                onChange={(e) => update(p.key, e.target.value)}
                placeholder={p.placeholder}
                aria-invalid={errors[p.key] ? true : undefined}
              />
              {errors[p.key] && <p className="text-xs text-destructive">{errors[p.key]}</p>}
            </div>
          ))}

          <p className="text-xs text-muted-foreground">
            The RSS feed is always available at <code className="rounded bg-muted px-1">/rss</code> and
            can’t be turned off.
          </p>

          <Button type="submit" disabled={saving}>
            {saving ? <Spinner /> : "Save social links"}
          </Button>
        </Card>
      </form>
    </div>
  );
}
