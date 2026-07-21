import { prisma } from "@/lib/prisma";
import { newsletterSchema } from "@/lib/validations";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { badRequest, ok, serverError, tooManyRequests } from "@/lib/api";

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const limited = rateLimit(`newsletter:${ip}`, 5, 60_000);
  if (!limited.success) return tooManyRequests();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid request body");
  }

  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) return badRequest("Enter a valid email", parsed.error.flatten());

  try {
    await prisma.subscriber.upsert({
      where: { email: parsed.data.email },
      update: { unsubscribedAt: null, confirmed: true },
      create: { email: parsed.data.email },
    });
    return ok({ success: true });
  } catch {
    return serverError("Could not subscribe. Please try again later.");
  }
}
