/**
 * Database seed script.
 * Run with:  npm run db:seed
 *
 * Creates:
 *  - An admin user (from ADMIN_* env vars) + a demo editor
 *  - The 10 default categories
 *  - A set of tags
 *  - 11 sample articles (published, scheduled, and draft) across categories
 *
 * The script is idempotent: it upserts by unique fields, so it is safe to re-run.
 */
import { PrismaClient, PostStatus, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function slugify(input: string): string {
  return input
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
  {
    name: "AI Tools",
    slug: "ai-tools",
    description:
      "Reviews, comparisons, and hands-on guides for the AI apps and assistants worth your time.",
  },
  {
    name: "Windows",
    slug: "windows",
    description: "Tips, fixes, and deep dives for getting the most out of Windows.",
  },
  {
    name: "Android",
    slug: "android",
    description: "How-tos, hidden features, and app picks for Android phones and tablets.",
  },
  {
    name: "iPhone",
    slug: "iphone",
    description: "Guides, troubleshooting, and tips for iPhone and iOS.",
  },
  {
    name: "Software Reviews",
    slug: "software-reviews",
    description: "Honest, in-depth reviews of the software we actually use.",
  },
  {
    name: "Productivity",
    slug: "productivity",
    description: "Workflows, habits, and tools to help you do more of what matters.",
  },
  {
    name: "Cybersecurity",
    slug: "cybersecurity",
    description: "Practical security and privacy advice for everyday people.",
  },
  {
    name: "Blogging",
    slug: "blogging",
    description: "Grow, monetize, and run a modern blog the smart way.",
  },
  {
    name: "Troubleshooting",
    slug: "troubleshooting",
    description: "Step-by-step fixes for the tech problems that drive you up the wall.",
  },
  {
    name: "Web Development",
    slug: "web-development",
    description: "Frontend, backend, and everything in between for building the modern web.",
  },
];

type SeedPost = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string; // slug
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
      excerpt:
        "Skip the hype. These are the AI tools we use every day to write faster, plan smarter, and cut busywork out of the calendar.",
      category: "ai-tools",
      author: "admin",
      tags: ["AI", "ChatGPT", "Automation", "Productivity"],
      status: PostStatus.PUBLISHED,
      featured: true,
      views: 4210,
      publishedAt: daysAgo(2),
      content: `
<p>Every week a new "revolutionary" AI app launches, and most of them are forgettable. After months of testing, these are the ten that genuinely earn a spot in our workflow.</p>
<h2>Writing and research</h2>
<p>The biggest time savings come from tools that handle first drafts and summarize dense material. Feed them your rough notes and let them shape structure while you focus on the ideas.</p>
<ul>
<li><strong>Drafting assistants</strong> for turning bullet points into readable prose.</li>
<li><strong>Summarizers</strong> that condense long PDFs into a page of takeaways.</li>
<li><strong>Transcription tools</strong> that turn meetings into searchable notes.</li>
</ul>
<h2>Planning and automation</h2>
<p>The second category quietly removes friction: scheduling helpers, inbox triage, and no-code automations that connect the apps you already use.</p>
<h3>A quick tip</h3>
<p>Pick <em>one</em> tool per task and go deep. Switching between five half-learned apps costs more time than it saves.</p>
<blockquote>The goal isn't to use more AI. It's to reclaim hours you can spend on work only you can do.</blockquote>
`,
    },
    {
      title: "How to Speed Up Windows 11: 12 Settings That Make a Real Difference",
      slug: "speed-up-windows-11",
      excerpt:
        "A slow PC is rarely a hardware problem. Here are the twelve Windows 11 tweaks that deliver a noticeable boost in minutes.",
      category: "windows",
      author: "admin",
      tags: ["Windows 11", "Performance", "Tips"],
      status: PostStatus.PUBLISHED,
      views: 3120,
      publishedAt: daysAgo(5),
      content: `
<p>Before you shop for a new laptop, try these tweaks. Most take under a minute and, stacked together, they add up to a machine that feels years younger.</p>
<h2>Startup and background apps</h2>
<p>The single biggest culprit behind sluggish boots is startup bloat. Open Task Manager, head to the Startup tab, and disable anything you don't need the moment you log in.</p>
<h2>Visual effects</h2>
<p>Windows spends real resources on animations. Switching to "Adjust for best performance" instantly frees them up, especially on integrated graphics.</p>
<h2>Storage and updates</h2>
<ul>
<li>Enable Storage Sense to clear temporary files automatically.</li>
<li>Keep drivers current — GPU drivers in particular.</li>
<li>Leave at least 15% of your SSD free so it can breathe.</li>
</ul>
<p>Do all twelve and you'll feel the difference on the very next restart.</p>
`,
    },
    {
      title: "Android 15 Hidden Features You Should Enable Today",
      slug: "android-15-hidden-features",
      excerpt:
        "Google buried some of Android 15's best upgrades a few menus deep. These are the ones worth turning on right now.",
      category: "android",
      author: "editor",
      tags: ["Android", "Pixel", "Tips"],
      status: PostStatus.PUBLISHED,
      views: 2755,
      publishedAt: daysAgo(8),
      content: `
<p>Android 15 shipped with a long list of headline features — and an even longer list of quiet ones. Here are the hidden gems worth digging for.</p>
<h2>Privacy and security</h2>
<p>Private Space lets you hide a second, locked profile for sensitive apps. Theft Detection Lock automatically locks the screen if your phone is snatched from your hand.</p>
<h2>Everyday quality of life</h2>
<ul>
<li>Predictive back gestures that preview where you're headed.</li>
<li>Per-app language settings for bilingual users.</li>
<li>Improved notification cooldown to tame chatty group chats.</li>
</ul>
<h3>Battery wins</h3>
<p>The new adaptive charging schedule learns your routine and finishes charging right before you wake up, reducing long-term battery wear.</p>
`,
    },
    {
      title: "iPhone Battery Draining Fast? Here's How to Fix It",
      slug: "iphone-battery-draining-fast-fix",
      excerpt:
        "From rogue background apps to a worn-out battery, here's a systematic way to find out what's killing your iPhone's battery — and fix it.",
      category: "iphone",
      author: "admin",
      tags: ["iPhone", "iOS", "Battery", "Troubleshooting"],
      status: PostStatus.PUBLISHED,
      featured: true,
      views: 5030,
      publishedAt: daysAgo(11),
      content: `
<p>A battery that used to last all day and now taps out by lunch is frustrating — but almost always fixable. Work through these steps in order.</p>
<h2>Step 1: Find the culprit</h2>
<p>Open <strong>Settings &rsaquo; Battery</strong> and look at the last 10 days. If one app dominates the chart, that's your suspect.</p>
<h2>Step 2: Check battery health</h2>
<p>Under <strong>Battery Health &amp; Charging</strong>, anything below 80% maximum capacity means the battery itself is aging and a replacement will help most.</p>
<h2>Step 3: The usual suspects</h2>
<ul>
<li>Turn off Background App Refresh for apps you don't need live.</li>
<li>Switch from push to fetch for email.</li>
<li>Reduce screen brightness and enable auto-lock at 30 seconds.</li>
</ul>
<blockquote>If nothing helps and health is good, a full reset of settings clears corrupted background states without deleting your data.</blockquote>
`,
    },
    {
      title: "Notion vs Obsidian: Which Note-Taking App Wins in 2026?",
      slug: "notion-vs-obsidian-2026",
      excerpt:
        "One is a flexible all-in-one workspace; the other is a lightning-fast, local-first knowledge base. Here's how to choose.",
      category: "software-reviews",
      author: "editor",
      tags: ["Notion", "Obsidian", "Productivity", "Review"],
      status: PostStatus.PUBLISHED,
      views: 3890,
      publishedAt: daysAgo(14),
      content: `
<p>Notion and Obsidian both have devoted followings, but they solve different problems. Pick based on how your brain works, not on which has more features.</p>
<h2>Notion: the all-in-one workspace</h2>
<p>Notion shines when you want databases, wikis, and docs in one collaborative place. It's cloud-first and superb for teams.</p>
<h2>Obsidian: local-first and fast</h2>
<p>Obsidian stores plain Markdown files on your device. It's private, blazing fast, and infinitely extensible through community plugins.</p>
<h3>The verdict</h3>
<ul>
<li>Choose <strong>Notion</strong> for collaboration and structured databases.</li>
<li>Choose <strong>Obsidian</strong> for private, long-term personal knowledge.</li>
</ul>
<p>Plenty of people use both — Notion for teamwork, Obsidian for thinking.</p>
`,
    },
    {
      title: "The 2-Minute Rule and 6 Other Habits That Transformed My Workflow",
      slug: "2-minute-rule-productivity-habits",
      excerpt:
        "Big productivity systems collapse under their own weight. These seven tiny habits actually stuck — and compounded.",
      category: "productivity",
      author: "admin",
      tags: ["Productivity", "Habits", "Tips"],
      status: PostStatus.PUBLISHED,
      views: 2140,
      publishedAt: daysAgo(18),
      content: `
<p>I've abandoned more productivity systems than I can count. What finally worked wasn't a system at all — it was a handful of small, repeatable habits.</p>
<h2>The 2-minute rule</h2>
<p>If a task takes less than two minutes, do it now. It sounds trivial, but it stops small tasks from piling into an overwhelming backlog.</p>
<h2>Time-blocking the first hour</h2>
<p>Protect the first hour of your day for the single most important task before email or chat can hijack your attention.</p>
<h2>The rest</h2>
<ul>
<li>One inbox, processed to zero once a day.</li>
<li>A shutdown ritual that closes the workday cleanly.</li>
<li>Weekly reviews to catch what slipped.</li>
</ul>
<p>None of these are revolutionary. Together, over months, they changed everything.</p>
`,
    },
    {
      title: "Password Managers Explained: Why You Need One in 2026",
      slug: "password-managers-explained-2026",
      excerpt:
        "Reusing passwords is the number one way people get hacked. A password manager fixes it — here's how they work and how to start.",
      category: "cybersecurity",
      author: "admin",
      tags: ["Security", "Privacy", "Passwords", "VPN"],
      status: PostStatus.PUBLISHED,
      featured: true,
      views: 4670,
      publishedAt: daysAgo(21),
      content: `
<p>The average person has hundreds of online accounts and remembers a dozen passwords — which means a lot of reuse. That reuse is exactly what attackers count on.</p>
<h2>What a password manager actually does</h2>
<p>It generates a long, random, unique password for every account and stores them in an encrypted vault. You remember one strong master password; it remembers the rest.</p>
<h2>Is it safe to put all my passwords in one place?</h2>
<p>Reputable managers use zero-knowledge, end-to-end encryption — the provider can't read your vault, even if their servers are breached. That's far safer than reused passwords in your head.</p>
<h3>Getting started</h3>
<ul>
<li>Pick a well-reviewed manager and set a long passphrase.</li>
<li>Turn on two-factor authentication.</li>
<li>Import your browser-saved passwords, then replace the weak ones.</li>
</ul>
<blockquote>Do this one thing and you've eliminated the most common cause of account compromise.</blockquote>
`,
    },
    {
      title: "Building Faster Websites: A Practical Guide to Core Web Vitals",
      slug: "practical-guide-core-web-vitals",
      excerpt:
        "LCP, INP, CLS — decoded. A hands-on guide to measuring and fixing the metrics Google actually ranks you on.",
      category: "web-development",
      author: "admin",
      tags: ["Web Development", "Performance", "Next.js", "SEO"],
      status: PostStatus.PUBLISHED,
      views: 1980,
      publishedAt: daysAgo(24),
      content: `
<p>Core Web Vitals turn "the site feels slow" into numbers you can measure and improve. Here's how to think about the three that matter.</p>
<h2>The three metrics</h2>
<ul>
<li><strong>LCP</strong> (Largest Contentful Paint) — how fast the main content appears.</li>
<li><strong>INP</strong> (Interaction to Next Paint) — how responsive the page feels.</li>
<li><strong>CLS</strong> (Cumulative Layout Shift) — how much the layout jumps around.</li>
</ul>
<h2>Fixing LCP</h2>
<p>Serve modern image formats, set explicit width and height, and preload your hero image. In Next.js, the built-in image component handles most of this for you:</p>
<pre><code class="language-tsx">import Image from "next/image";

export function Hero() {
  return (
    &lt;Image
      src="/hero.jpg"
      alt="Hero"
      width={1200}
      height={630}
      priority
    /&gt;
  );
}</code></pre>
<h2>Fixing CLS</h2>
<p>Always reserve space for images, ads, and embeds. Use <code>font-display: swap</code> and preload fonts so text doesn't reflow when the web font loads.</p>
<p>Measure with Lighthouse and the Chrome DevTools Performance panel, change one thing at a time, and re-measure.</p>
`,
    },
    {
      title: "How to Start a Tech Blog That Actually Gets Traffic",
      slug: "how-to-start-a-tech-blog",
      excerpt:
        "Anyone can publish. Getting read is the hard part. Here's the playbook for building a tech blog that ranks and grows.",
      category: "blogging",
      author: "editor",
      tags: ["Blogging", "SEO", "Tips"],
      status: PostStatus.PUBLISHED,
      views: 1660,
      publishedAt: daysAgo(28),
      content: `
<p>Starting a blog is easy. Building one people actually find is a different skill. Here's what moves the needle in the first year.</p>
<h2>Pick a narrow niche first</h2>
<p>"Technology" is not a niche. "Windows troubleshooting for small businesses" is. Narrow topics let you rank before you have authority.</p>
<h2>Write for a real search intent</h2>
<p>Every post should answer a question someone is actively typing into Google. Match the format they expect — a how-to, a comparison, a fix.</p>
<h2>Technical foundations</h2>
<ul>
<li>Fast, mobile-first pages.</li>
<li>Clean URLs and internal links between related posts.</li>
<li>Structured data so search engines understand your content.</li>
</ul>
<p>Consistency beats intensity. Publish something useful every week and let compounding do the rest.</p>
`,
    },
    {
      title: "Wi-Fi Keeps Disconnecting? 9 Fixes That Work",
      slug: "wifi-keeps-disconnecting-fixes",
      excerpt:
        "An intermittent Wi-Fi drop is maddening. Work through these nine fixes, from the router to your adapter drivers, to make it stop.",
      category: "troubleshooting",
      author: "admin",
      tags: ["Troubleshooting", "WiFi", "Networking"],
      status: PostStatus.SCHEDULED,
      views: 0,
      publishedAt: daysFromNow(3),
      content: `
<p>Wi-Fi that drops every few minutes is one of the most frustrating problems to diagnose because the causes are so varied. This checklist works from the most common cause to the rarest.</p>
<h2>Start with the basics</h2>
<ul>
<li>Restart the router and modem — power-cycle for a full 30 seconds.</li>
<li>Move closer to the router to rule out range.</li>
<li>Switch to the 5 GHz band for less interference.</li>
</ul>
<h2>Update and reset</h2>
<p>Outdated network adapter drivers cause more drops than anything else on laptops. Update them, and if that fails, reset your network stack.</p>
<h2>Advanced fixes</h2>
<p>Change your DNS, disable power management on the adapter, and check for channel congestion with a Wi-Fi analyzer app.</p>
`,
    },
    {
      title: "A Gentle Introduction to TypeScript for JavaScript Developers",
      slug: "gentle-introduction-to-typescript",
      excerpt:
        "TypeScript can feel intimidating from the outside. If you know JavaScript, you're already 90% of the way there.",
      category: "web-development",
      author: "editor",
      tags: ["Web Development", "TypeScript", "JavaScript"],
      status: PostStatus.DRAFT,
      views: 0,
      publishedAt: null,
      content: `
<p>TypeScript is just JavaScript with types. If you can write JavaScript, you can start using TypeScript today and add types gradually.</p>
<h2>Your first types</h2>
<p>Annotating variables and function parameters catches whole categories of bugs before you run the code:</p>
<pre><code class="language-ts">function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

greet("Ada");   // ok
greet(42);       // Error: number is not assignable to string</code></pre>
<h2>Interfaces and types</h2>
<p>Describe the shape of your data once and reuse it everywhere:</p>
<pre><code class="language-ts">interface User {
  id: string;
  name: string;
  admin?: boolean; // optional
}</code></pre>
<p>Start with <code>strict</code> mode on, let the compiler guide you, and you'll wonder how you shipped without it.</p>
`,
    },
  ];
}

async function main() {
  console.log("🌱  Seeding database...");

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
      twitter: "techblog",
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
  console.log(`✓ ${categories.length} categories`);

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
  console.log(`✓ ${posts.length} posts`);

  await prisma.subscriber.upsert({
    where: { email: "reader@example.com" },
    update: {},
    create: { email: "reader@example.com" },
  });

  console.log("✅  Seed complete.");
  console.log(`    Admin login: ${adminEmail} / (ADMIN_PASSWORD from your .env)`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌  Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
