import { NextResponse } from "next/server";

import { uploadToCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

type JsonUploadBody = {
  file?: string;
  base64?: string;
  mimeType?: string;
  folder?: string;
  publicId?: string;
  resourceType?: "image" | "video" | "raw" | "auto";
  overwrite?: boolean;
};

function normalizePath(value?: string): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }

  return trimmed.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
}

function normalizeDataUri(body: JsonUploadBody): string {
  const raw = body.file?.trim() || body.base64?.trim() || "";
  if (!raw) {
    throw new Error("Missing file or base64 input");
  }

  if (raw.startsWith("data:")) {
    return raw;
  }

  const mimeType = body.mimeType?.trim() || "application/octet-stream";
  return `data:${mimeType};base64,${raw}`;
}

async function uploadFormData(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file input" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const folder = normalizePath(formData.get("folder")?.toString());
  const publicId = normalizePath(formData.get("publicId")?.toString());
  const resourceType = (formData.get("resourceType")?.toString() as JsonUploadBody["resourceType"]) || "auto";
  const overwrite = formData.get("overwrite")?.toString() === "true";

  const upload = await uploadToCloudinary({
    file: buffer,
    folder,
    publicId,
    resourceType,
    overwrite,
  });

  return NextResponse.json({
    url: upload.secure_url,
    publicId: upload.public_id,
    resourceType: upload.resource_type,
  });
}

async function uploadJson(request: Request) {
  const body = (await request.json()) as JsonUploadBody;
  const upload = await uploadToCloudinary({
    file: normalizeDataUri(body),
    folder: normalizePath(body.folder),
    publicId: normalizePath(body.publicId),
    resourceType: body.resourceType || "auto",
    overwrite: Boolean(body.overwrite),
  });

  return NextResponse.json({
    url: upload.secure_url,
    publicId: upload.public_id,
    resourceType: upload.resource_type,
  });
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      return await uploadFormData(request);
    }

    return await uploadJson(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
