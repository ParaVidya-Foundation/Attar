import "server-only";

import { v2 as cloudinary, type UploadApiOptions, type UploadApiResponse } from "cloudinary";

type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

type UploadSource = string | Buffer;

export type CloudinaryUploadInput = {
  file: UploadSource;
  folder?: string;
  publicId?: string;
  resourceType?: UploadApiOptions["resource_type"];
  overwrite?: boolean;
  tags?: string[];
};

let configured = false;
let cachedConfig: CloudinaryConfig | null = null;

function readRequiredEnv(
  key: "CLOUDINARY_CLOUD_NAME" | "CLOUDINARY_API_KEY" | "CLOUDINARY_API_SECRET",
): string {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export function getCloudinaryConfig(): CloudinaryConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  cachedConfig = {
    cloudName: readRequiredEnv("CLOUDINARY_CLOUD_NAME"),
    apiKey: readRequiredEnv("CLOUDINARY_API_KEY"),
    apiSecret: readRequiredEnv("CLOUDINARY_API_SECRET"),
  };

  return cachedConfig;
}

function ensureCloudinaryConfigured() {
  if (configured) {
    return;
  }

  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();

  cloudinary.config({
    secure: true,
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  configured = true;
}

function normalizePathSegment(value?: string): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }

  return trimmed.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
}

function uploadBuffer(buffer: Buffer, options: UploadApiOptions): Promise<UploadApiResponse> {
  ensureCloudinaryConfigured();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      if (!result) {
        reject(new Error("Cloudinary upload failed: empty result"));
        return;
      }

      resolve(result);
    });

    stream.end(buffer);
  });
}

export async function uploadToCloudinary({
  file,
  folder,
  publicId,
  resourceType = "auto",
  overwrite = false,
  tags,
}: CloudinaryUploadInput): Promise<UploadApiResponse> {
  ensureCloudinaryConfigured();

  const normalizedFolder = normalizePathSegment(folder);
  const normalizedPublicId = normalizePathSegment(publicId);

  const options: UploadApiOptions = {
    resource_type: resourceType,
    folder: normalizedFolder,
    public_id: normalizedPublicId,
    overwrite,
    invalidate: overwrite,
    unique_filename: false,
    use_filename: false,
    tags,
  };

  if (Buffer.isBuffer(file)) {
    return uploadBuffer(file, options);
  }

  return cloudinary.uploader.upload(file, options);
}

export { cloudinary };
export default cloudinary;
