import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm">
        <Suspense fallback={<div className="text-center text-muted-foreground">Loading…</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
