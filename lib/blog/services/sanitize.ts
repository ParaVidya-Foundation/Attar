/**
 * HTML sanitizer for blog content rendered via dangerouslySetInnerHTML.
 * Strips dangerous tags, event handlers, javascript: URIs, and inline styles.
 */
export function sanitizeBlogHtml(content: string | null): string | null {
  if (!content) return content;

  let safe = content;
  safe = safe.replace(/<\s*\/?\s*(script|style|iframe|object|embed|form|input|button|textarea|select|meta|link|base)\b[^>]*>/gi, "");
  safe = safe.replace(/\son\w+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, "");
  safe = safe.replace(/\sstyle\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, "");
  safe = safe.replace(/\s(srcdoc)\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, "");
  safe = safe.replace(/\s(href|src|xlink:href)\s*=\s*("|\')\s*(javascript:|data:text\/html)/gi, ' $1=$2#');
  safe = safe.replace(/\s(href|src|xlink:href)\s*=\s*([^\s>"']+)/gi, (full, attr: string, value: string) => {
    const normalized = String(value).trim().toLowerCase();
    if (normalized.startsWith("javascript:") || normalized.startsWith("data:text/html")) return ` ${attr}="#"`;
    return full;
  });
  return safe;
}

export function estimateReadingTime(html: string | null): number {
  if (!html) return 0;
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const wordCount = text.split(" ").filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
