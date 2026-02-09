import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Attar, BlogPost } from "./types";

const dataDir = path.join(process.cwd(), "data");

async function readJson<T>(fileName: string): Promise<T> {
  const filePath = path.join(dataDir, fileName);
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

export async function getAttars(): Promise<Attar[]> {
  return readJson<Attar[]>("attars.json");
}

export async function getAttarBySlug(slug: string): Promise<Attar | null> {
  const all = await getAttars();
  return all.find((a) => a.slug === slug) ?? null;
}

export async function getBlogs(): Promise<BlogPost[]> {
  return readJson<BlogPost[]>("blogs.json");
}

export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  const all = await getBlogs();
  return all.find((b) => b.slug === slug) ?? null;
}
