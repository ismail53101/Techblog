"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export function SettingsForm({
  initial,
}: {
  initial: { ga4Id: string; gscVerification: string };
}) {
  const [ga4Id, setGa4Id] = React.useState(initial.ga4Id);
  const [gsc, setGsc] = React.useState(initial.gscVerification);
  const [saving, setSaving] = React.useState(false);
  const [importing, setImporting] = React.useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ga4Id, gscVerification: gsc }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) toast.success("Settings saved. Analytics & verification will apply within a moment.");
      else toast.error(data.error || "Could not save settings");
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function importContent() {
    if (
      !window.confirm(
        "This DELETES all current articles and imports the 30 starter articles. Continue?"
      )
    )
      return;
    setImporting(true);
    try {
      const res = await fetch("/api/admin/import-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reset: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) toast.success(`Imported ${data.imported} articles across ${data.categories} categories.`);
      else toast.error(data.error || "Import failed");
    } catch {
      toast.error("Network error");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Settings</h1>

      <form onSubmit={save}>
        <Card className="space-y-5 p-6">
          <div>
            <h2 className="font-heading text-lg font-semibold">Integrations</h2>
            <p className="text-sm text-muted-foreground">
              Paste your codes below — no redeploy needed; they apply automatically.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ga4">Google Analytics 4 — Measurement ID</Label>
            <Input
              id="ga4"
              value={ga4Id}
              onChange={(e) => setGa4Id(e.target.value)}
              placeholder="G-XXXXXXXXXX"
            />
            <p className="text-xs text-muted-foreground">
              Google Analytics → Admin → Data Streams → your web stream → “Measurement ID”. Once saved,
              GA4 loads automatically and tracks page views, article views, search, downloads, and
              outbound clicks.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gsc">Google Search Console — verification code</Label>
            <Input
              id="gsc"
              value={gsc}
              onChange={(e) => setGsc(e.target.value)}
              placeholder="Paste only the content value of the HTML-tag meta"
            />
            <p className="text-xs text-muted-foreground">
              Search Console → Settings → Ownership verification → “HTML tag”. Copy the value inside{" "}
              <code className="rounded bg-muted px-1">content=&quot;…&quot;</code> (not the whole tag).
            </p>
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? <Spinner /> : "Save settings"}
          </Button>
        </Card>
      </form>

      <Card className="space-y-4 p-6">
        <div>
          <h2 className="font-heading text-lg font-semibold">Content</h2>
          <p className="text-sm text-muted-foreground">
            Import the 30 bundled starter articles. This <strong>replaces all existing articles</strong> and
            resets categories to the standard set — ideal for a fresh launch.
          </p>
        </div>
        <Button variant="outline" onClick={importContent} disabled={importing}>
          {importing ? <Spinner /> : "Import 30 starter articles (replaces demo)"}
        </Button>
      </Card>
    </div>
  );
}
