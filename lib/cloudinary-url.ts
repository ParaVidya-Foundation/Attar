type CloudinaryDimensions = {
  width?: number;
  height?: number;
};

function getCloudName(): string {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  if (!cloudName) {
    throw new Error("Missing environment variable: CLOUDINARY_CLOUD_NAME");
  }

  return cloudName;
}

function normalizeAssetPath(path: string): string {
  return path.trim().replace(/\\/g, "/").replace(/^\/+/, "");
}

function isTransformationSegment(segment: string): boolean {
  return segment.includes(",") && segment.split(",").every((part) => /^[a-z]{1,3}_.+$/i.test(part));
}

function buildTransformation({ width, height }: CloudinaryDimensions): string {
  const parts = ["f_auto", "q_auto"];

  if (typeof width === "number" && width > 0) {
    parts.push(`w_${Math.round(width)}`);
  }

  if (typeof height === "number" && height > 0) {
    parts.push(`h_${Math.round(height)}`, "c_limit");
  }

  return parts.join(",");
}

function extractCloudinaryPublicId(value: string): string {
  if (!value.startsWith("http://") && !value.startsWith("https://")) {
    return normalizeAssetPath(value);
  }

  try {
    const url = new URL(value);
    if (url.hostname !== "res.cloudinary.com") {
      return value;
    }

    const marker = "/upload/";
    const uploadIndex = url.pathname.indexOf(marker);

    if (uploadIndex === -1) {
      return value;
    }

    const uploadedPath = url.pathname
      .slice(uploadIndex + marker.length)
      .split("/")
      .filter(Boolean);
    const versionIndex = uploadedPath.findIndex((segment) => /^v\d+$/.test(segment));
    const segments =
      versionIndex >= 0
        ? uploadedPath.slice(versionIndex + 1)
        : isTransformationSegment(uploadedPath[0] ?? "")
          ? uploadedPath.slice(1)
          : uploadedPath;

    return segments.length > 0 ? normalizeAssetPath(segments.join("/")) : value;
  } catch {
    return value;
  }
}

export function getCloudinaryImage(path: string, width?: number, height?: number): string {
  const publicId = extractCloudinaryPublicId(path);
  if (publicId.startsWith("http://") || publicId.startsWith("https://")) {
    return publicId;
  }

  const transformation = buildTransformation({ width, height });

  return `https://res.cloudinary.com/${getCloudName()}/image/upload/${transformation}/${publicId}`;
}
