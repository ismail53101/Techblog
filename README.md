# TechBlog — a production-ready technology blogging platform

A modern, fast, SEO-first blogging CMS built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **PostgreSQL**, **Prisma**, and **Auth.js (NextAuth v5)**. Publish unlimited articles from a secure admin dashboard — no code required.

---

## ✨ Features

**Content & Admin**
- Secure admin dashboard (credentials auth, hashed passwords, role-based access: Admin / Editor / Author)
- Rich text editor (TipTap): headings, lists, quotes, **code blocks with syntax highlighting**, tables, links, image upload, YouTube embeds, text alignment
- Create / edit / delete articles, **save drafts**, and **schedule publishing**
- Automatic slug generation, reading-time calculation, featured images, multiple images
- Category, tag, user, and **media library** management
- Dashboard with stats and analytics placeholders

**Reading experience**
- Responsive, mobile-first, accessible UI with **dark / light mode**
- Table of contents with scroll-spy, reading progress bar, breadcrumbs
- Related articles, author profiles, share buttons, **bookmarks** (localStorage — no login needed)
- Copy-to-clipboard on code blocks, popular / trending / latest lists, pagination
- **Instant search** (⌘K) by title, category, and tag

**SEO & performance**
- Per-page metadata, Open Graph, Twitter Cards, canonical URLs
- JSON-LD structured data (Article, BreadcrumbList, WebSite, Organization)
- Dynamic **sitemap.xml**, **robots.txt**, **RSS feed**, dynamic OG images
- `next/image` optimization, lazy loading, font optimization, ISR caching

**Security**
- Input validation with Zod, HTML sanitization (stored-XSS defense)
- CSRF protection via Auth.js, security headers + CSP, in-memory rate limiting
- Parameterized queries via Prisma (SQL-injection safe)

---

## 🧰 Tech stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router, RSC) |
| Language | TypeScript |
| Styling | Tailwind CSS + `@tailwindcss/typography` |
| Database | PostgreSQL |
| ORM | Prisma 5 |
| Auth | Auth.js / NextAuth v5 (credentials + JWT) |
| Editor | TipTap 2 |
| Images | Cloudinary |
| Icons | lucide-react |
| Toasts | sonner |

---

## 🚀 Quick start

### 1. Prerequisites
- **Node.js ≥ 18.17**
- A **PostgreSQL** database (local, or a free cloud DB from [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app))
- A free **[Cloudinary](https://cloudinary.com)** account (for image uploads)

### 2. Install
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
```
Then fill in `.env` (see [Environment variables](#-environment-variables)). At minimum set `DATABASE_URL`, `AUTH_SECRET`, and the Cloudinary keys.

Generate a secret:
```bash
openssl rand -base64 32
```

### 4. Set up the database
```bash
npm run db:generate      # generate the Prisma client
npm run db:migrate       # create tables (dev) — or: npm run db:deploy for prod
npm run db:seed          # seed categories, sample posts, and the admin user
```
> Prefer a no-migration setup? Use `npx prisma db push` instead of `db:migrate`.

### 5. Run
```bash
npm run dev
```
- Site: <http://localhost:3000>
- Admin: <http://localhost:3000/admin> → sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from your `.env`.

---

## 🔑 Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Public site URL, no trailing slash (used for SEO, sitemap, RSS, OG). |
| `NEXT_PUBLIC_SITE_NAME` | – | Brand name shown across the site. |
| `NEXT_PUBLIC_SITE_DESCRIPTION` | – | Default meta description. |
| `DATABASE_URL` | ✅ | PostgreSQL connection string. |
| `AUTH_SECRET` | ✅ | Secret for signing sessions (`openssl rand -base64 32`). |
| `AUTH_URL` | – | Deployment URL (set on Vercel to your prod URL). |
| `AUTH_TRUST_HOST` | – | `"true"` for non-Vercel / custom hosts. |
| `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | ✅ (seed) | Initial admin account created by the seed. |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name. |
| `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | ✅ | Cloudinary credentials (server-side). |
| `CLOUDINARY_FOLDER` | – | Folder for uploads (default `techblog`). |
| `CRON_SECRET` | ✅ (prod) | Bearer token protecting the scheduled-publish cron. |
| `RESEND_API_KEY` / `CONTACT_TO_EMAIL` | – | Optional: email contact-form submissions via Resend. |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | – | Optional: distributed rate limiting for production. |

---

## 🗄️ Database

- **Schema:** `prisma/schema.prisma`
- **Seed:** `prisma/seed.ts` (10 default categories, sample posts incl. a scheduled + a draft, an admin + a demo editor)
- **Migrations:** an initial migration ships in `prisma/migrations/0_init`.

Common commands:
```bash
npm run db:migrate    # prisma migrate dev (creates/apply migrations locally)
npm run db:deploy     # prisma migrate deploy (apply migrations in production)
npm run db:push       # prisma db push (sync schema without migrations)
npm run db:seed       # run the seed
npm run db:studio     # open Prisma Studio
npm run db:reset      # drop + recreate + seed (destructive)
```

### Default categories
AI Tools · Windows · Android · iPhone · Software Reviews · Productivity · Cybersecurity · Blogging · Troubleshooting · Web Development

---

## 🖼️ Cloudinary setup
1. Create a free account and open the **Dashboard**.
2. Copy your **Cloud name**, **API Key**, and **API Secret** into `.env`.
3. Uploads from the editor and media library are stored under the `CLOUDINARY_FOLDER` and served optimized via `next/image`.

---

## ⏰ Scheduled publishing
- Set a post to **Scheduled** with a future date/time in the editor.
- A cron route (`/api/cron/publish`) flips due posts to **Published**.
- On Vercel, `vercel.json` registers the cron (every 10 minutes). Vercel sends `Authorization: Bearer $CRON_SECRET`, so set `CRON_SECRET` in your project env.
- **Free (Hobby) plan:** Vercel limits cron to ~once/day. A ready-made GitHub Actions workflow (`.github/workflows/scheduled-publish.yml`) calls the endpoint every 10 minutes instead — add `SITE_URL` and `CRON_SECRET` as repo secrets to enable it (details in [DEPLOYMENT.md](./DEPLOYMENT.md)).
- Trigger manually:
  ```bash
  curl -H "Authorization: Bearer $CRON_SECRET" https://yourdomain.com/api/cron/publish
  ```

---

## 📁 Project structure
```
techblog/
├─ prisma/
│  ├─ schema.prisma          # data model
│  ├─ seed.ts                # seed data
│  └─ migrations/            # SQL migrations
├─ public/                   # favicon, icon, static assets
├─ src/
│  ├─ app/
│  │  ├─ (site)/             # public pages (home, blog, category, tag, author, search, about, contact, privacy, terms)
│  │  ├─ admin/
│  │  │  ├─ login/           # sign-in page
│  │  │  └─ (panel)/         # authenticated dashboard (posts, categories, tags, media, users)
│  │  ├─ api/                # route handlers (posts, categories, tags, users, upload, media, search, newsletter, contact, cron, og, auth)
│  │  ├─ feed.xml/           # RSS
│  │  ├─ sitemap.ts          # dynamic sitemap
│  │  ├─ robots.ts           # robots.txt
│  │  ├─ manifest.ts         # PWA manifest
│  │  └─ layout.tsx          # root layout (fonts, theme, metadata)
│  ├─ components/
│  │  ├─ ui/                 # design-system primitives
│  │  ├─ layout/             # header, footer, nav, search, theme toggle
│  │  ├─ blog/               # cards, TOC, share, bookmarks, related, pagination…
│  │  └─ admin/              # dashboard, editor, managers
│  ├─ lib/                   # prisma, auth, seo, sanitize, posts (data access), utils…
│  ├─ hooks/                 # useDebounce, useBookmarks, useMediaQuery
│  ├─ types/                 # type augmentation
│  └─ middleware.ts          # protects /admin
├─ .env.example
├─ next.config.mjs           # security headers, image domains
├─ tailwind.config.ts
└─ vercel.json               # cron schedule
```

---

## 🔐 Roles
| Role | Capabilities |
| --- | --- |
| **Admin** | Everything, including user management. |
| **Editor** | Manage all posts, categories, tags, media. |
| **Author** | Create and manage **their own** posts. |

Create additional users in **Admin → Users**.

---

## ☁️ Deploy to Vercel

> 📖 **Prefer a detailed, click-by-click walkthrough?** See **[DEPLOYMENT.md](./DEPLOYMENT.md)** — it covers a free Neon Postgres database, Cloudinary, every environment variable, and scheduled-publishing cron.

1. Push this repo to GitHub/GitLab/Bitbucket.
2. In Vercel, **Import Project**.
3. Add all environment variables (from `.env.example`). Set `NEXT_PUBLIC_SITE_URL` and `AUTH_URL` to your production URL.
4. Provision a PostgreSQL database (Neon/Supabase/Vercel Postgres) and set `DATABASE_URL`.
5. Run migrations against production once:
   ```bash
   npx prisma migrate deploy      # or: npx prisma db push
   npm run db:seed                # optional: seed initial content
   ```
   (Run locally with your production `DATABASE_URL`, or as a Vercel deploy/release step.)
6. Deploy. The included `vercel.json` enables the scheduled-publish cron automatically (ensure `CRON_SECRET` is set).

> **Build command** is `prisma generate && next build` (already in `package.json`). No extra config needed.

---

## 🎨 Customization
- **Brand / URL / description:** environment variables (`NEXT_PUBLIC_SITE_*`).
- **Navigation & footer:** `src/lib/constants.ts`.
- **Theme colors:** CSS variables in `src/app/globals.css` (`--primary`, etc.).
- **Fonts:** the `<link>` in `src/app/layout.tsx` (Inter / Sora / JetBrains Mono) + `--font-*` in `globals.css`.
- **Categories:** edit in the admin, or change the seed defaults in `prisma/seed.ts`.

---

## 🛡️ Security notes
- All write endpoints validate input with Zod and require an authenticated session with the right role.
- Article HTML is sanitized on save **and** render (`sanitize-html`), restricting tags/attributes and allowing embeds only from YouTube/Vimeo.
- Security headers and a Content-Security-Policy are set in `next.config.mjs`.
- Rate limiting is in-memory by default. For multi-instance/serverless production, back it with Upstash Redis (`@upstash/ratelimit`) — swap the internals of `src/lib/rate-limit.ts`; call sites don't change.

---

## ⚡ Performance & Core Web Vitals
- React Server Components by default; client JS only where needed (editor, search, interactions).
- `next/image` (AVIF/WebP), font-display swap + preconnect, ISR caching on public pages.
- Code is split; the editor and search modal are dynamically loaded on the client.
- For a Lighthouse 95+ target, deploy on Vercel, keep images in Cloudinary, and set a real `DATABASE_URL` so ISR can cache warm pages.

---

## 📜 Scripts
| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | `prisma generate` + production build |
| `npm run start` | Start the production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check (no emit) |
| `npm run db:*` | Prisma helpers (see [Database](#-database)) |

---

## 🧪 Troubleshooting
- **`Environment variable not found: DATABASE_URL`** — create `.env` from `.env.example`.
- **Prisma client errors** — run `npm run db:generate`.
- **Image upload fails** — check the three Cloudinary variables are set.
- **Can't sign in** — run `npm run db:seed`, then use `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
- **Scheduled posts not publishing locally** — the cron only runs on Vercel; trigger it manually with the `curl` command above.

---

## License
MIT — use it freely for personal or commercial projects.
