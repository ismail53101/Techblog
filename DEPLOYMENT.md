# Deploying TechBlog to Vercel

A complete, start-to-finish guide to deploying this project on **Vercel** with a free **PostgreSQL** database (Neon) and **Cloudinary** for images. Budget 20–30 minutes; everything here fits on free tiers.

## What you'll do
1. [Push the code to GitHub](#1-push-the-code-to-github)
2. [Create a free PostgreSQL database (Neon)](#2-create-a-free-postgresql-database-neon)
3. [Create a free Cloudinary account](#3-create-a-free-cloudinary-account)
4. [Generate secrets & run the migration + seed](#4-generate-secrets--run-the-migration--seed)
5. [Import into Vercel & set environment variables](#5-import-into-vercel--set-environment-variables)
6. [Set the real URL and redeploy](#6-set-the-real-url-and-redeploy)
7. [Verify](#7-verify-it-works) · [Scheduled publishing](#8-scheduled-publishing-cron) · [Custom domain](#optional--custom-domain)

---

## 1. Push the code to GitHub
Vercel deploys from a Git repo. From the project folder:

```bash
git init
git add .
git commit -m "Initial commit: TechBlog platform"
git branch -M main
git remote add origin https://github.com/<your-username>/techblog.git
git push -u origin main
```

> `.gitignore` already excludes `node_modules`, `.next`, and `.env`, so no secrets are committed.

---

## 2. Create a free PostgreSQL database (Neon)
1. Sign up at **[neon.tech](https://neon.tech)** (free tier is plenty).
2. **Create a project**, choosing a region near your Vercel region.
3. Open **Dashboard → Connect** and copy **two** connection strings (toggle "Pooled connection"):
   - **Pooled** — host contains `-pooler` — used by the app at runtime.
   - **Direct** — no `-pooler` — used once to run migrations.

| Purpose | Which string | Append |
| --- | --- | --- |
| App runtime (`DATABASE_URL` on Vercel) | **Pooled** | `?sslmode=require&pgbouncer=true&connection_limit=1` |
| Running migrations (local, one-time) | **Direct** | `?sslmode=require` |

> **Why two?** Prisma's `migrate deploy` needs a direct connection (pooled PgBouncer breaks migration locks), while serverless functions should use the pooled URL to avoid exhausting connections.
>
> **Simpler alternative:** In Vercel, **Storage → Create Database → Postgres** (Neon-powered) auto-adds env vars. If you use it, set `DATABASE_URL` to the value of the `POSTGRES_PRISMA_URL` it creates.

---

## 3. Create a free Cloudinary account
1. Sign up at **[cloudinary.com](https://cloudinary.com)**.
2. On the **Dashboard** (Programmable Media), copy three values:
   - **Cloud name** → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** (click to reveal) → `CLOUDINARY_API_SECRET`

Uploads flow through an authenticated API route and are served optimized via `next/image`.

---

## 4. Generate secrets & run the migration + seed
Generate two random secrets:

```bash
openssl rand -base64 32   # run twice → AUTH_SECRET and CRON_SECRET
```
*(Windows without openssl:* `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`*)*

Create the tables and seed content against your Neon database, **from your machine**, using the **direct** URL:

```bash
# from the project folder, after: npm install
DATABASE_URL="postgresql://…direct-url…?sslmode=require" npx prisma migrate deploy

DATABASE_URL="postgresql://…direct-url…?sslmode=require" \
ADMIN_NAME="Your Name" ADMIN_EMAIL="you@example.com" ADMIN_PASSWORD="a-strong-password" \
npm run db:seed
```

The seed creates your **admin login** (the email/password above), the 10 categories, and sample posts. Run it at least once so you have a user to sign in with (or use `npm run db:studio` to add one manually).

---

## 5. Import into Vercel & set environment variables
1. Go to **[vercel.com](https://vercel.com)** → **Add New → Project** → import your GitHub repo.
2. Framework preset auto-detects **Next.js**. Leave the **Build Command** as the default `npm run build` (it runs `prisma generate && next build`) and **Install Command** as `npm install`.
3. Before deploying, add these **Environment Variables** (scope: **Production**, plus Preview if desired):

| Variable | Example / value | Secret |
| --- | --- | :---: |
| `DATABASE_URL` | pooled Neon URL (+`pgbouncer=true&connection_limit=1`) | 🔒 |
| `AUTH_SECRET` | first `openssl` output | 🔒 |
| `AUTH_TRUST_HOST` | `true` | |
| `NEXT_PUBLIC_SITE_NAME` | `TechBlog` | |
| `NEXT_PUBLIC_SITE_DESCRIPTION` | your tagline | |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | your cloud name | |
| `CLOUDINARY_API_KEY` | your key | 🔒 |
| `CLOUDINARY_API_SECRET` | your secret | 🔒 |
| `CLOUDINARY_FOLDER` | `techblog` | |
| `CRON_SECRET` | second `openssl` output | 🔒 |
| `NEXT_PUBLIC_SITE_URL` | placeholder for now (e.g. `https://example.com`) | |
| `AUTH_URL` | placeholder for now | |

Optional: `RESEND_API_KEY` + `CONTACT_TO_EMAIL` (email the contact form), and `UPSTASH_REDIS_REST_URL` / `_TOKEN` (distributed rate limiting).

4. Click **Deploy**.

> `NEXT_PUBLIC_*` values are baked in at build time — changing them later requires a redeploy.

---

## 6. Set the real URL and redeploy
After the first deploy, Vercel gives you a URL like `https://techblog-xxxx.vercel.app`.
1. Update these to that URL (no trailing slash):
   - `NEXT_PUBLIC_SITE_URL` = `https://techblog-xxxx.vercel.app`
   - `AUTH_URL` = same value
2. **Redeploy** (Deployments → ⋯ → Redeploy). Canonical URLs, sitemap, RSS, OG images, and sign-in now use the correct domain.

---

## 7. Verify it works
- Visit your URL → home page with seeded articles.
- Go to **`/admin`** → sign in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from step 4.
- Create a post, upload a cover image (confirms Cloudinary), and publish.
- Check `/sitemap.xml`, `/robots.txt`, and `/feed.xml` load.

---

## 8. Scheduled publishing (cron)
`vercel.json` already registers a cron hitting `/api/cron/publish` every 10 minutes; Vercel automatically sends `Authorization: Bearer $CRON_SECRET`, which the route verifies. **Just ensure `CRON_SECRET` is set.**

> ⚠️ **Free-tier caveat:** Vercel's **Hobby plan limits cron to roughly once per day**. The `*/10 * * * *` schedule runs as-is on **Pro**. On Hobby, either:
> - change `vercel.json` to a daily schedule (e.g. `"schedule": "0 8 * * *"`), **or**
> - use the **included GitHub Actions workflow** (`.github/workflows/scheduled-publish.yml`), which calls the endpoint every 10 minutes for free — see below.

### Free-tier scheduled publishing with GitHub Actions
This repo ships a workflow at **`.github/workflows/scheduled-publish.yml`** that pings `/api/cron/publish` every 10 minutes (and on demand). To enable it:

1. In your GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**, and add:
   - `SITE_URL` — your production URL (e.g. `https://your-domain.vercel.app`)
   - `CRON_SECRET` — the **same** value you set in Vercel
2. Push to GitHub. The workflow appears under the **Actions** tab, runs automatically, and can also be triggered manually via **Run workflow**.

Manual test from your terminal:
```bash
curl -H "Authorization: Bearer <YOUR_CRON_SECRET>" https://your-domain/api/cron/publish
```

> GitHub's scheduled runs are best-effort and may be delayed a few minutes under load — fine for publishing. You can keep `vercel.json`'s cron as well (it just runs daily on Hobby); the endpoint is idempotent, so overlapping calls are harmless.

---

## Optional — Custom domain
Project → **Settings → Domains** → add your domain and follow the DNS steps. Then update `NEXT_PUBLIC_SITE_URL` and `AUTH_URL` to the custom domain and redeploy.

## Ongoing — when you change the schema
Locally: edit `prisma/schema.prisma` → `npx prisma migrate dev --name <change>` → commit the new migration → push. Then run `npx prisma migrate deploy` against production (direct URL).

## Troubleshooting
| Symptom | Fix |
| --- | --- |
| `Can't reach database` / build fails | Ensure `DATABASE_URL` is set for **Production** and includes `?sslmode=require`. |
| Login fails in production | Confirm the seed ran against the **production** DB and `AUTH_SECRET` + `AUTH_URL` are set; redeploy after changes. |
| Images won't upload | Verify all three Cloudinary vars (the secret is easy to miss). |
| Scheduled posts never publish (Hobby) | See the cron caveat above. |
