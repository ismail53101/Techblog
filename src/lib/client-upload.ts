export type UploadResult = {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
};

/** Upload an image File to the server (which stores it in Cloudinary). */
export async function uploadImageFile(file: File, alt?: string): Promise<UploadResult> {
  const fd = new FormData();
  fd.append("file", file);
  if (alt) fd.append("alt", alt);

  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Upload failed");
  }
  return res.json();
}
