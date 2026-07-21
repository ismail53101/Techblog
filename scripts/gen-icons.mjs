// Build-time icon generation: rasterizes public/favicon.svg into the PNG icon
// set (favicon PNG, PWA 192/512, Apple touch). Runs before `next build` so the
// PNGs are bundled as static assets. Non-fatal: a failure only warns.
import fs from "node:fs";
import path from "node:path";

async function main() {
  const { default: sharp } = await import("sharp");
  const pub = path.join(process.cwd(), "public");
  const svg = fs.readFileSync(path.join(pub, "favicon.svg"));
  const targets = [
    ["icon.png", 512],
    ["icon-192.png", 192],
    ["apple-touch-icon.png", 180],
  ];
  for (const [name, size] of targets) {
    await sharp(svg, { density: 400 }).resize(size, size).png().toFile(path.join(pub, name));
  }
  console.log("✓ Generated icons:", targets.map((t) => t[0]).join(", "));
}

main().catch((e) => {
  console.warn("⚠ Icon generation skipped:", e?.message || e);
  process.exit(0); // never fail the build over icons
});
