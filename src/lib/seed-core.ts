/**
 * Shared seed logic used by BOTH the CLI seed (`prisma/seed.ts` via `npm run db:seed`)
 * and the one-time `/api/setup` route. It is idempotent: every write is an upsert,
 * so running it repeatedly never creates duplicates.
 *
 * It intentionally depends only on @prisma/client and bcryptjs (no `@/` alias imports)
 * so it can also run under `tsx` from the prisma/ directory.
 */
import { type PrismaClient, PostStatus, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

function slugify(input: string): string {
  const normalized = input.toString().normalize("NFKD");
  let stripped = "";
  for (const ch of normalized) {
    const code = ch.codePointAt(0) ?? 0;
    if (code >= 0x300 && code <= 0x36f) continue;
    stripped += ch;
  }
  return stripped
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readingTime(html: string): number {
  const words = html
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

const categories: { name: string; slug: string; description: string }[] = [
  { name: "AI Tools", slug: "ai-tools", description: "Reviews, comparisons, and hands-on guides for the AI apps and assistants worth your time." },
  { name: "Windows", slug: "windows", description: "Tips, fixes, and deep dives for getting the most out of Windows." },
  { name: "Android", slug: "android", description: "How-tos, hidden features, and app picks for Android phones and tablets." },
  { name: "iPhone", slug: "iphone", description: "Guides, troubleshooting, and tips for iPhone and iOS." },
  { name: "Software Reviews", slug: "software-reviews", description: "Honest, in-depth reviews of the software we actually use." },
  { name: "Productivity", slug: "productivity", description: "Workflows, habits, and tools to help you do more of what matters." },
  { name: "Cybersecurity", slug: "cybersecurity", description: "Practical security and privacy advice for everyday people." },
  { name: "Blogging", slug: "blogging", description: "Grow, monetize, and run a modern blog the smart way." },
  { name: "Troubleshooting", slug: "troubleshooting", description: "Step-by-step fixes for the tech problems that drive you up the wall." },
  { name: "Web Development", slug: "web-development", description: "Frontend, backend, and everything in between for building the modern web." },
];

type SeedPost = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: "admin" | "editor";
  tags: string[];
  status: PostStatus;
  featured?: boolean;
  views?: number;
  publishedAt?: Date | null;
};

function buildPosts(): SeedPost[] {
  return [
    {
      title: "10 AI Tools That Will Actually Save You Hours Every Week",
      slug: "ai-tools-that-save-you-hours",
      excerpt: "Skip the hype. These are the AI tools we use every day to write faster, plan smarter, and cut busywork out of the calendar.",
      category: "ai-tools",
      author: "admin",
      tags: ["AI", "ChatGPT", "Automation", "Productivity"],
      status: PostStatus.PUBLISHED,
      featured: true,
      views: 4210,
      publishedAt: daysAgo(2),
      content: `<p>Every week a new "revolutionary" AI app launches, and most are forgettable. After months of testing, these ten genuinely earn a spot in our workflow.</p>
<h2>Writing and research</h2>
<p>The biggest time savings come from tools that handle first drafts and summarize dense material.</p>
<ul><li><strong>Drafting assistants</strong> for turning bullet points into prose.</li><li><strong>Summarizers</strong> that condense long PDFs.</li></ul>
<h2>Planning and automation</h2>
<p>The second category quietly removes friction: scheduling helpers, inbox triage, and no-code automations.</p>
<blockquote>The goal isn't to use more AI. It's to reclaim hours for work only you can do.</blockquote>`,
    },
    {
      title: "How to Speed Up Windows 11: 12 Settings That Make a Real Difference",
      slug: "speed-up-windows-11",
      excerpt: "A slow PC is rarely a hardware problem. Here are the twelve Windows 11 tweaks that deliver a noticeable boost in minutes.",
      category: "windows",
      author: "admin",
      tags: ["Windows 11", "Performance", "Tips"],
      status: PostStatus.PUBLISHED,
      views: 3120,
      publishedAt: daysAgo(5),
      content: `<p>Before you shop for a new laptop, try these tweaks. Most take under a minute.</p>
<h2>Startup and background apps</h2>
<p>The biggest culprit behind sluggish boots is startup bloat. Open Task Manager and disable what you don't need.</p>
<h2>Visual effects</h2>
<p>Switching to "Adjust for best performance" instantly frees up resources, especially on integrated graphics.</p>`,
    },
    {
      title: "Android 15 Hidden Features You Should Enable Today",
      slug: "android-15-hidden-features",
      excerpt: "Google buried some of Android 15's best upgrades a few menus deep. These are the ones worth turning on right now.",
      category: "android",
      author: "editor",
      tags: ["Android", "Pixel", "Tips"],
      status: PostStatus.PUBLISHED,
      views: 2755,
      publishedAt: daysAgo(8),
      content: `<p>Android 15 shipped with a long list of headline features and an even longer list of quiet ones.</p>
<h2>Privacy and security</h2>
<p>Private Space hides a second, locked profile for sensitive apps. Theft Detection Lock locks the screen if your phone is snatched.</p>`,
    },
    {
      title: "iPhone Battery Draining Fast? Here's How to Fix It",
      slug: "iphone-battery-draining-fast-fix",
      excerpt: "From rogue background apps to a worn-out battery, here's a systematic way to find what's killing your iPhone's battery.",
      category: "iphone",
      author: "admin",
      tags: ["iPhone", "iOS", "Battery", "Troubleshooting"],
      status: PostStatus.PUBLISHED,
      featured: true,
      views: 5030,
      publishedAt: daysAgo(11),
      content: `<p>A battery that used to last all day and now taps out by lunch is frustrating but almost always fixable.</p>
<h2>Step 1: Find the culprit</h2>
<p>Open <strong>Settings &rsaquo; Battery</strong> and look at the last 10 days. A dominating app is your suspect.</p>
<h2>Step 2: Check battery health</h2>
<p>Below 80% maximum capacity means the battery is aging and a replacement helps most.</p>`,
    },
    {
      title: "Notion vs Obsidian: Which Note-Taking App Wins in 2026?",
      slug: "notion-vs-obsidian-2026",
      excerpt: "One is a flexible all-in-one workspace; the other is a lightning-fast, local-first knowledge base. Here's how to choose.",
      category: "software-reviews",
      author: "editor",
      tags: ["Notion", "Obsidian", "Productivity", "Review"],
      status: PostStatus.PUBLISHED,
      views: 3890,
      publishedAt: daysAgo(14),
      content: `<p>Notion and Obsidian both have devoted followings, but they solve different problems.</p>
<h2>Notion: the all-in-one workspace</h2>
<p>Notion shines when you want databases, wikis, and docs in one collaborative place.</p>
<h2>Obsidian: local-first and fast</h2>
<p>Obsidian stores plain Markdown on your device. It's private, fast, and endlessly extensible.</p>`,
    },
    {
      title: "The 2-Minute Rule and 6 Other Habits That Transformed My Workflow",
      slug: "2-minute-rule-productivity-habits",
      excerpt: "Big productivity systems collapse under their own weight. These seven tiny habits actually stuck — and compounded.",
      category: "productivity",
      author: "admin",
      tags: ["Productivity", "Habits", "Tips"],
      status: PostStatus.PUBLISHED,
      views: 2140,
      publishedAt: daysAgo(18),
      content: `<p>What finally worked wasn't a system at all, but a handful of small, repeatable habits.</p>
<h2>The 2-minute rule</h2>
<p>If a task takes less than two minutes, do it now. It stops small tasks from piling into a backlog.</p>`,
    },
    {
      title: "Password Managers Explained: Why You Need One in 2026",
      slug: "password-managers-explained-2026",
      excerpt: "Reusing passwords is the number one way people get hacked. A password manager fixes it — here's how they work.",
      category: "cybersecurity",
      author: "admin",
      tags: ["Security", "Privacy", "Passwords", "VPN"],
      status: PostStatus.PUBLISHED,
      featured: true,
      views: 4670,
      publishedAt: daysAgo(21),
      content: `<p>The average person has hundreds of accounts and remembers a dozen passwords — which means a lot of reuse.</p>
<h2>What a password manager does</h2>
<p>It generates a long, random, unique password for every account and stores them in an encrypted vault.</p>`,
    },
    {
      title: "Building Faster Websites: A Practical Guide to Core Web Vitals",
      slug: "practical-guide-core-web-vitals",
      excerpt: "LCP, INP, CLS — decoded. A hands-on guide to measuring and fixing the metrics Google actually ranks you on.",
      category: "web-development",
      author: "admin",
      tags: ["Web Development", "Performance", "Next.js", "SEO"],
      status: PostStatus.PUBLISHED,
      views: 1980,
      publishedAt: daysAgo(24),
      content: `<p>Core Web Vitals turn "the site feels slow" into numbers you can measure.</p>
<h2>The three metrics</h2>
<ul><li><strong>LCP</strong> — how fast the main content appears.</li><li><strong>INP</strong> — how responsive the page feels.</li><li><strong>CLS</strong> — how much the layout shifts.</li></ul>
<pre><code class="language-tsx">import Image from "next/image";
export function Hero() {
  return &lt;Image src="/hero.jpg" alt="Hero" width={1200} height={630} priority /&gt;;
}</code></pre>`,
    },
    {
      title: "How to Start a Tech Blog That Actually Gets Traffic",
      slug: "how-to-start-a-tech-blog",
      excerpt: "Anyone can publish. Getting read is the hard part. Here's the playbook for building a tech blog that ranks and grows.",
      category: "blogging",
      author: "editor",
      tags: ["Blogging", "SEO", "Tips"],
      status: PostStatus.PUBLISHED,
      views: 1660,
      publishedAt: daysAgo(28),
      content: `<p>Starting a blog is easy. Building one people find is a different skill.</p>
<h2>Pick a narrow niche first</h2>
<p>"Technology" is not a niche. Narrow topics let you rank before you have authority.</p>`,
    },
    {
      title: "Wi-Fi Keeps Disconnecting? 9 Fixes That Work",
      slug: "wifi-keeps-disconnecting-fixes",
      excerpt: "An intermittent Wi-Fi drop is maddening. Work through these nine fixes, from the router to your adapter drivers.",
      category: "troubleshooting",
      author: "admin",
      tags: ["Troubleshooting", "WiFi", "Networking"],
      status: PostStatus.SCHEDULED,
      views: 0,
      publishedAt: daysFromNow(3),
      content: `<p>Wi-Fi that drops every few minutes is frustrating to diagnose. This checklist works from most common to rarest.</p>
<h2>Start with the basics</h2>
<ul><li>Restart the router and modem.</li><li>Move closer to rule out range.</li><li>Switch to the 5 GHz band.</li></ul>`,
    },
    {
      title: "A Gentle Introduction to TypeScript for JavaScript Developers",
      slug: "gentle-introduction-to-typescript",
      excerpt: "TypeScript can feel intimidating from the outside. If you know JavaScript, you're already 90% of the way there.",
      category: "web-development",
      author: "editor",
      tags: ["Web Development", "TypeScript", "JavaScript"],
      status: PostStatus.DRAFT,
      views: 0,
      publishedAt: null,
      content: `<p>TypeScript is just JavaScript with types. You can add types gradually.</p>
<h2>Your first types</h2>
<pre><code class="language-ts">function greet(name: string): string {
  return \`Hello, \${name}!\`;
}</code></pre>`,
    },
  ];
}

export type SeedResult = { adminEmail: string; categories: number; posts: number };

/** Idempotently seed the database. Safe to run multiple times. */
export async function runSeed(prisma: PrismaClient): Promise<SeedResult> {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const adminName = process.env.ADMIN_NAME || "Site Admin";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { name: adminName, role: Role.ADMIN },
    create: {
      email: adminEmail,
      name: adminName,
      passwordHash,
      role: Role.ADMIN,
      bio: "Editor-in-chief. Writes about AI, security, and the tools that make computing better.",
      avatarUrl: "https://picsum.photos/seed/admin-avatar/200/200",
      twitter: "fixpedia",
      website: "https://example.com",
    },
  });

  const editor = await prisma.user.upsert({
    where: { email: "jordan@example.com" },
    update: {},
    create: {
      email: "jordan@example.com",
      name: "Jordan Lee",
      passwordHash,
      role: Role.EDITOR,
      bio: "Senior editor covering mobile, productivity, and consumer software.",
      avatarUrl: "https://picsum.photos/seed/jordan-avatar/200/200",
      twitter: "jordanwrites",
    },
  });

  const catIdBySlug: Record<string, string> = {};
  for (const c of categories) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description },
      create: c,
    });
    catIdBySlug[c.slug] = cat.id;
  }

  const posts = buildPosts();
  for (const p of posts) {
    const authorId = p.author === "admin" ? admin.id : editor.id;
    const content = p.content.trim();
    await prisma.post.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content,
        coverImage: `https://picsum.photos/seed/${p.slug}/1200/630`,
        coverImageAlt: p.title,
        status: p.status,
        featured: p.featured ?? false,
        readingTime: readingTime(content),
        views: p.views ?? 0,
        metaTitle: p.title,
        metaDescription: p.excerpt,
        publishedAt: p.publishedAt ?? null,
        author: { connect: { id: authorId } },
        category: { connect: { id: catIdBySlug[p.category] } },
        tags: {
          connectOrCreate: p.tags.map((t) => ({
            where: { slug: slugify(t) },
            create: { name: t, slug: slugify(t) },
          })),
        },
      },
    });
  }

  await prisma.subscriber.upsert({
    where: { email: "reader@example.com" },
    update: {},
    create: { email: "reader@example.com" },
  });

  return { adminEmail, categories: categories.length, posts: posts.length };
}
