import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validations";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { siteConfig } from "@/lib/constants";
import { badRequest, ok, serverError, tooManyRequests } from "@/lib/api";

async function sendEmailNotification(data: {
  name: string;
  email: string;
  subject?: string | null;
  message: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) return; // Email delivery is optional.

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${siteConfig.name} <onboarding@resend.dev>`,
        to: [to],
        reply_to: data.email,
        subject: `[Contact] ${data.subject || "New message"} — from ${data.name}`,
        text: `From: ${data.name} <${data.email}>\n\n${data.message}`,
      }),
    });
  } catch {
    /* non-fatal: the message is already persisted */
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const limited = rateLimit(`contact:${ip}`, 5, 60_000);
  if (!limited.success) return tooManyRequests();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid request body");
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return badRequest("Please check the form and try again", parsed.error.flatten());

  try {
    await prisma.contactMessage.create({ data: parsed.data });
    await sendEmailNotification(parsed.data);
    return ok({ success: true });
  } catch {
    return serverError("Could not send your message. Please try again later.");
  }
}
