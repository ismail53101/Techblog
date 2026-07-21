import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SETTING_KEYS } from "@/lib/settings";
import { SocialLinksForm } from "@/components/admin/social-links-form";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminSocialSettingsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return (
      <Card className="p-8 text-center">
        <h1 className="font-heading text-xl font-bold">Admins only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You don&rsquo;t have permission to manage social links.
        </p>
      </Card>
    );
  }

  const initial = { github: "", youtube: "", twitter: "", facebook: "", linkedin: "" };
  try {
    const rows = await prisma.siteSetting.findMany();
    const m = new Map(rows.map((r) => [r.key, r.value]));
    initial.github = m.get(SETTING_KEYS.socialGithub) || "";
    initial.youtube = m.get(SETTING_KEYS.socialYoutube) || "";
    initial.twitter = m.get(SETTING_KEYS.socialTwitter) || "";
    initial.facebook = m.get(SETTING_KEYS.socialFacebook) || "";
    initial.linkedin = m.get(SETTING_KEYS.socialLinkedin) || "";
  } catch {
    /* table may not exist yet */
  }

  return <SocialLinksForm initial={initial} />;
}
