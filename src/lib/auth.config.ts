import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js configuration shared between the middleware (edge runtime)
 * and the full server-side auth instance. It must NOT import the database
 * client, bcrypt, or any Node-only modules — those live in `auth.ts`.
 */
export const authConfig = {
  pages: {
    signIn: "/admin/login",
  },
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    // Gate the /admin area. Runs in middleware for every matched request.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const path = nextUrl.pathname;
      const isLoginPage = path.startsWith("/admin/login");
      const isAdminArea = path.startsWith("/admin");

      if (isLoginPage) return true;
      if (isAdminArea) return isLoggedIn;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        // `role` is attached in the Credentials authorize() callback.
        token.role = (user as { role?: "ADMIN" | "EDITOR" | "AUTHOR" }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? session.user.id;
        session.user.role = (token.role as "ADMIN" | "EDITOR" | "AUTHOR") ?? "AUTHOR";
      }
      return session;
    },
  },
  providers: [], // Added in auth.ts (Node runtime).
} satisfies NextAuthConfig;
