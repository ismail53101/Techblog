/**
 * Database seed entry point. Run with:  npm run db:seed
 *
 * The actual logic lives in src/lib/seed-core.ts so it can be shared with the
 * one-time /api/setup route. This wrapper just wires up a PrismaClient.
 */
import { PrismaClient } from "@prisma/client";
import { runSeed } from "../src/lib/seed-core";

const prisma = new PrismaClient();

runSeed(prisma)
  .then((result) => {
    console.log("✅  Seed complete.");
    console.log(`    Categories: ${result.categories}, posts: ${result.posts}`);
    console.log(`    Admin login: ${result.adminEmail} / (ADMIN_PASSWORD from your env)`);
  })
  .catch((e) => {
    console.error("❌  Seed failed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
