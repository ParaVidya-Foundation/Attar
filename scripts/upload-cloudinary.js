const fs = require("node:fs");
const path = require("node:path");
const { v2: cloudinary } = require("cloudinary");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config();

const PUBLIC_DIR = path.join(process.cwd(), "public");
const SUPPORTED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".svg", ".mp4"]);

function requireEnv(key) {
  const value = process.env[key] && process.env[key].trim();
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

cloudinary.config({
  secure: true,
  cloud_name: requireEnv("CLOUDINARY_CLOUD_NAME"),
  api_key: requireEnv("CLOUDINARY_API_KEY"),
  api_secret: requireEnv("CLOUDINARY_API_SECRET"),
});

function walkDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDirectory(fullPath));
      continue;
    }

    if (SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }

  return files;
}

function toPublicId(filePath) {
  const relative = path.relative(PUBLIC_DIR, filePath).split(path.sep).join("/");
  const ext = path.extname(relative);
  return ext ? relative.slice(0, -ext.length) : relative;
}

function getResourceType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".mp4") return "video";
  if (ext === ".svg") return "raw";
  return "image";
}

async function uploadFile(filePath) {
  const publicId = toPublicId(filePath);
  const resourceType = getResourceType(filePath);

  const options = {
    resource_type: resourceType,
    public_id: publicId,
    overwrite: true,
    invalidate: true,
    unique_filename: false,
    use_filename: false,
  };

  if (resourceType === "raw") {
    options.public_id = publicId + path.extname(filePath);
  }

  const result = await cloudinary.uploader.upload(filePath, options);

  console.log("Uploaded:");
  console.log(path.relative(process.cwd(), filePath));
  console.log(`→ ${result.secure_url}`);
  console.log("");
}

async function main() {
  if (!fs.existsSync(PUBLIC_DIR)) {
    throw new Error(`Public directory not found: ${PUBLIC_DIR}`);
  }

  const files = walkDirectory(PUBLIC_DIR);
  console.log(`Found ${files.length} uploadable files in /public`);
  console.log("");

  let uploaded = 0;
  let failed = 0;
  const failures = [];

  for (const filePath of files) {
    try {
      await uploadFile(filePath);
      uploaded++;
    } catch (err) {
      failed++;
      const rel = path.relative(process.cwd(), filePath);
      const msg = err.message || JSON.stringify(err);
      failures.push(`${rel}: ${msg}`);
      console.log(`FAILED: ${rel}`);
      console.log(`  Error: ${msg}`);
      console.log("");
    }
  }

  console.log("=".repeat(50));
  console.log(`Cloudinary bulk upload complete.`);
  console.log(`  Uploaded: ${uploaded}`);
  console.log(`  Failed:   ${failed}`);
  if (failures.length > 0) {
    console.log("\nFailed files:");
    for (const f of failures) console.log(`  ${f}`);
  }
  console.log("=".repeat(50));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
