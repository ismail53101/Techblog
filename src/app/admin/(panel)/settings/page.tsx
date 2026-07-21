import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SETTING_KEYS } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/settings-form";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return (
      <Card className="p-8 text-center">
        <h1 className="font-heading text-xl font-bold">Admins only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You don&rsquo;t have permission to manage settings.
        </p>
      </Card>
    );
  }

  let ga4Id = "";
  let gscVerification = "";
  try {
    const rows = await prisma.siteSetting.findMany();
    const m = new Map(rows.map((r) => [r.key, r.value]));
    ga4Id = m.get(SETTING_KEYS.ga4Id) || "";
    gscVerification = m.get(SETTING_KEYS.gscVerification) || "";
  } catch {
    /* table may not exist yet */
  }

  return <SettingsForm initial={{ ga4Id, gscVerification }} />;
}
