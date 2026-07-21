import { prisma } from "@/lib/prisma";
import { destroyAsset } from "@/lib/cloudinary";
import { requireAuth, badRequest, ok, serverError } from "@/lib/api";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { response } = await requireAuth(["ADMIN", "EDITOR", "AUTHOR"]);
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const take = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 60));

  try {
    const media = await prisma.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
      take,
    });
    return ok({ media });
  } catch {
    return ok({ media: [] });
  }
}

export async function DELETE(request: Request) {
  const { response } = await requireAuth(["ADMIN", "EDITOR"]);
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const publicId = searchParams.get("publicId");
  if (!publicId) return badRequest("Missing publicId");

  try {
    await destroyAsset(publicId);
    await prisma.mediaAsset.deleteMany({ where: { publicId } });
    return ok({ success: true });
  } catch {
    return serverError("Could not delete asset");
  }
}
