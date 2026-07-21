import { getCurrentUser } from "@/lib/auth";
import { UserManager } from "@/components/admin/user-manager";
import { Card } from "@/components/ui/card";

export default async function AdminUsersPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return (
      <Card className="p-8 text-center">
        <h1 className="font-heading text-xl font-bold">Admins only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You don&rsquo;t have permission to manage users.
        </p>
      </Card>
    );
  }

  return <UserManager currentUserId={user.id} />;
}
