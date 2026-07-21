import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Use the edge-safe config (no database access) for the middleware.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Protect the entire admin area. The `authorized` callback in auth.config.ts
  // allows the login page through and requires a session everywhere else.
  matcher: ["/admin/:path*"],
};
