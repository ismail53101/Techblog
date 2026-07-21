import { prisma } from "@/lib/prisma";
import { cloudinaryConfigured, uploadDataUri } from "@/lib/cloudinary";
import { requireAuth, badRequest, ok, serverError } from "@/lib/api";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/svg+xml"];

export async function POST(request: Request) {
  const { user, response } = await requireAuth(["ADMIN", "EDITOR", "AUTHOR"]);
  if (response) return response;

  if (!cloudinaryConfigured) {
    return serverError("Image uploads are not configured. Set your Cloudinary environment variables.");
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return badRequest("Expected multipart form data");
  }

  const file = form.get("file");
  if (!(file instanceof File)) return badRequest("No file provided");
  if (!ALLOWED.includes(file.type)) return badRequest("Unsupported file type");
  if (file.size > MAX_BYTES) return badRequest("File is too large (max 8 MB)");

  const alt = (form.get("alt") as string | null) || null;

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type};base64,${bytes.toString("base64")}`;
    const asset = await uploadDataUri(dataUri);

    await prisma.mediaAsset.create({
      data: {
        publicId: asset.publicId,
        url: asset.url,
        width: asset.width,
        height: asset.height,
        format: asset.format,
        bytes: asset.bytes,
        alt,
        uploadedById: user.id,
      },
    });

    return ok(asset, 201);
  } catch {
    return serverError("Upload failed. Please try again.");
  }
}
