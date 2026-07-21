import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const cloudinaryConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

const DEFAULT_FOLDER = process.env.CLOUDINARY_FOLDER || "techblog";

export type UploadedAsset = {
  publicId: string;
  url: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
};

/** Upload an image provided as a data URI (base64) to Cloudinary. */
export async function uploadDataUri(dataUri: string, folder = DEFAULT_FOLDER): Promise<UploadedAsset> {
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
    overwrite: false,
    unique_filename: true,
  });
  return {
    publicId: result.public_id,
    url: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

/** Permanently delete an asset by its Cloudinary public id. */
export async function destroyAsset(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}

export { cloudinary };
