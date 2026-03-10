/**
 * URL/network safety helpers for payment integrations.
 * Blocks localhost, loopback, and private-network resource URLs for third-party iframes.
 */

export type UrlSafetyResult = {
  ok: boolean;
  normalizedUrl?: string;
  hostname?: string;
  reason?: string;
  isLocalhost: boolean;
  isLoopback: boolean;
  isPrivateNetwork: boolean;
};

function isIpv4(hostname: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
}

function isIpv4Private(hostname: string): boolean {
  const parts = hostname.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part) || part < 0 || part > 255)) return false;

  const [a, b] = parts;
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 169 && b === 254) return true; // 169.254.0.0/16 (link-local)
  if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 (CGNAT)
  return false;
}

function isIpv4Loopback(hostname: string): boolean {
  const parts = hostname.split(".").map((part) => Number(part));
  return parts.length === 4 && parts[0] === 127;
}

function isIpv6Loopback(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  return normalized === "::1" || normalized === "0:0:0:0:0:0:0:1";
}

function isIpv6PrivateOrLocal(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  return normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe80:");
}

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

export function validatePublicHttpsUrl(rawUrl: string | undefined | null): UrlSafetyResult {
  const initial: UrlSafetyResult = {
    ok: false,
    isLocalhost: false,
    isLoopback: false,
    isPrivateNetwork: false,
  };

  if (!rawUrl || !rawUrl.trim()) {
    return { ...initial, reason: "URL is missing" };
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { ...initial, reason: "URL is not a valid absolute URL" };
  }

  const hostname = parsed.hostname.toLowerCase();
  const protocol = parsed.protocol.toLowerCase();

  if (protocol !== "https:") {
    return {
      ...initial,
      hostname,
      reason: "URL must use HTTPS",
    };
  }

  const isLocalhost =
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "0.0.0.0";

  const ipv4 = isIpv4(hostname);
  const ipv4Loopback = ipv4 && isIpv4Loopback(hostname);
  const ipv4Private = ipv4 && isIpv4Private(hostname);
  const ipv6Loopback = hostname.includes(":") && isIpv6Loopback(hostname);
  const ipv6Private = hostname.includes(":") && isIpv6PrivateOrLocal(hostname);
  const isLoopback = ipv4Loopback || ipv6Loopback;
  const isPrivateNetwork = ipv4Private || ipv6Private;

  if (isLocalhost || isLoopback || isPrivateNetwork) {
    return {
      ...initial,
      hostname,
      isLocalhost,
      isLoopback,
      isPrivateNetwork,
      reason: "URL points to localhost, loopback, or private network",
    };
  }

  return {
    ok: true,
    normalizedUrl: trimTrailingSlash(parsed.toString()),
    hostname,
    isLocalhost,
    isLoopback,
    isPrivateNetwork,
  };
}

export function getSafeCheckoutBranding(siteUrl: string | undefined | null): {
  safeSiteUrl?: string;
  safeLogoUrl?: string;
  diagnostics: UrlSafetyResult;
} {
  const diagnostics = validatePublicHttpsUrl(siteUrl);
  if (!diagnostics.ok || !diagnostics.normalizedUrl) {
    return { diagnostics };
  }

  const safeSiteUrl = diagnostics.normalizedUrl;
  return {
    safeSiteUrl,
    safeLogoUrl: `${safeSiteUrl}/logo.png`,
    diagnostics,
  };
}
