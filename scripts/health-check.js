/**
 * Integration health check — verifies Cloudinary, Redis, Algolia, and Sentry connectivity.
 * Run: node scripts/health-check.js
 */
const path = require("node:path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config();

const results = {
  cloudinary: { status: "PENDING", details: [] },
  redis: { status: "PENDING", details: [] },
  algolia: { status: "PENDING", details: [] },
  sentry: { status: "PENDING", details: [] },
  env: { status: "PENDING", details: [] },
};

function pass(service, msg) {
  results[service].details.push(`  PASS  ${msg}`);
}
function fail(service, msg) {
  results[service].status = "FAIL";
  results[service].details.push(`  FAIL  ${msg}`);
}
function warn(service, msg) {
  results[service].details.push(`  WARN  ${msg}`);
}

async function checkEnvVars() {
  const required = {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    ALGOLIA_APP_ID: process.env.ALGOLIA_APP_ID,
    ALGOLIA_ADMIN_KEY: process.env.ALGOLIA_ADMIN_KEY,
    ALGOLIA_SEARCH_KEY: process.env.ALGOLIA_SEARCH_KEY,
    ALGOLIA_INDEX_NAME: process.env.ALGOLIA_INDEX_NAME,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    SENTRY_DSN: process.env.SENTRY_DSN,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
  };

  let allPresent = true;
  for (const [key, value] of Object.entries(required)) {
    if (!value || value.trim() === "") {
      fail("env", `${key} is MISSING`);
      allPresent = false;
    } else if (value.includes("your-") || value === "rzp_live_XXXXXXXX") {
      warn("env", `${key} = "${value}" (appears to be a placeholder)`);
    } else {
      pass("env", `${key} present (${value.slice(0, 8)}...)`);
    }
  }

  if (allPresent) results.env.status = "PASS";
  else results.env.status = "FAIL";
}

async function checkCloudinary() {
  try {
    const { v2: cloudinary } = require("cloudinary");
    cloudinary.config({
      secure: true,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const result = await cloudinary.api.ping();
    if (result.status === "ok") {
      pass("cloudinary", `SDK configured — ping returned "ok"`);
      results.cloudinary.status = "PASS";
    } else {
      fail("cloudinary", `Ping returned unexpected: ${JSON.stringify(result)}`);
    }

    const usage = await cloudinary.api.usage();
    pass("cloudinary", `Account usage: ${usage.credits?.used_percent ?? "N/A"}% credits used`);
    pass("cloudinary", `Total resources: ${usage.resources ?? "N/A"}`);
  } catch (err) {
    fail("cloudinary", `Connection failed: ${err.message}`);
  }
}

async function checkRedis() {
  try {
    const { Redis } = require("@upstash/redis");
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      fail("redis", "UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set");
      return;
    }

    const redis = new Redis({ url, token });

    await redis.set("health-check", "ok");
    pass("redis", `SET health-check = "ok" — success`);

    const value = await redis.get("health-check");
    if (value === "ok") {
      pass("redis", `GET health-check = "${value}" — matches`);
      results.redis.status = "PASS";
    } else {
      fail("redis", `GET health-check returned "${value}" — expected "ok"`);
    }

    await redis.del("health-check");
    pass("redis", "DEL health-check — cleaned up");

    await redis.set("cache:health-test", JSON.stringify({ ts: Date.now() }), { ex: 60 });
    const cached = await redis.get("cache:health-test");
    if (cached) {
      pass("redis", `Cache SET/GET test — success`);
    }
    await redis.del("cache:health-test");
  } catch (err) {
    fail("redis", `Connection failed: ${err.message}`);
  }
}

async function checkAlgolia() {
  try {
    const { algoliasearch } = require("algoliasearch");
    const appId = process.env.ALGOLIA_APP_ID;
    const adminKey = process.env.ALGOLIA_ADMIN_KEY;
    const searchKey = process.env.ALGOLIA_SEARCH_KEY;
    const indexName = process.env.ALGOLIA_INDEX_NAME || "products";

    if (!appId || !adminKey) {
      fail("algolia", "ALGOLIA_APP_ID or ALGOLIA_ADMIN_KEY not set");
      return;
    }

    const adminClient = algoliasearch(appId, adminKey);

    const testObject = {
      objectID: "integration-test",
      id: "integration-test",
      name: "Integration Test Product",
      price: 999,
      image: "",
      category: "test",
      description: "Health check test object",
    };

    await adminClient.saveObjects({
      indexName,
      objects: [testObject],
    });
    pass("algolia", `Indexed test object (objectID: "integration-test")`);

    await new Promise((r) => setTimeout(r, 2000));

    const searchClient = algoliasearch(appId, searchKey || adminKey);
    const { results } = await searchClient.search({
      requests: [{ indexName, query: "integration" }],
    });

    const hits = results[0]?.hits ?? [];
    if (hits.length > 0) {
      pass("algolia", `Search for "integration" returned ${hits.length} hit(s)`);
      results.algolia = results.algolia; // keep reference
    } else {
      warn("algolia", `Search for "integration" returned 0 hits (index may be processing)`);
    }

    await adminClient.deleteObjects({
      indexName,
      objectIDs: ["integration-test"],
    });
    pass("algolia", `Cleaned up test object`);

    results.algolia = results.algolia; // keep reference
  } catch (err) {
    fail("algolia", `Connection failed: ${err.message}`);
  }

  if (!results.algolia.details.some((d) => d.includes("FAIL"))) {
    results.algolia.status = "PASS";
  }
}

async function checkSentry() {
  try {
    const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (!dsn) {
      fail("sentry", "SENTRY_DSN / NEXT_PUBLIC_SENTRY_DSN not set");
      return;
    }

    const dsnRegex = /^https:\/\/[a-f0-9]+@[^/]+\/\d+$/;
    if (dsnRegex.test(dsn)) {
      pass("sentry", `DSN format valid: ${dsn.slice(0, 30)}...`);
    } else {
      warn("sentry", `DSN format may be non-standard: ${dsn.slice(0, 30)}...`);
    }

    if (process.env.SENTRY_AUTH_TOKEN) {
      if (process.env.SENTRY_AUTH_TOKEN.startsWith("sntrys_")) {
        pass("sentry", "SENTRY_AUTH_TOKEN format valid (sntrys_ prefix)");
      } else {
        warn("sentry", "SENTRY_AUTH_TOKEN does not start with sntrys_");
      }
    } else {
      warn("sentry", "SENTRY_AUTH_TOKEN not set — source maps will not upload");
    }

    if (process.env.SENTRY_PROJECT === "your-project-name") {
      fail("sentry", `SENTRY_PROJECT is a placeholder ("your-project-name") — source maps will fail`);
    } else {
      pass("sentry", `SENTRY_PROJECT = "${process.env.SENTRY_PROJECT}"`);
    }

    pass("sentry", `SENTRY_ORG = "${process.env.SENTRY_ORG}"`);

    const fs = require("node:fs");
    for (const f of ["sentry.server.config.ts", "sentry.client.config.ts", "sentry.edge.config.ts", "instrumentation.ts"]) {
      if (fs.existsSync(path.join(process.cwd(), f))) {
        pass("sentry", `${f} exists`);
      } else {
        fail("sentry", `${f} MISSING`);
      }
    }

    if (!results.sentry.details.some((d) => d.includes("FAIL"))) {
      results.sentry.status = "PASS";
    }
  } catch (err) {
    fail("sentry", `Check failed: ${err.message}`);
  }
}

function printReport() {
  console.log("");
  console.log("=".repeat(64));
  console.log("  SYSTEM HEALTH REPORT");
  console.log("=".repeat(64));
  console.log("");

  for (const [service, data] of Object.entries(results)) {
    const icon = data.status === "PASS" ? "PASS" : data.status === "FAIL" ? "FAIL" : "WARN";
    console.log(`[${icon}]  ${service.toUpperCase()}`);
    for (const detail of data.details) {
      console.log(detail);
    }
    console.log("");
  }

  console.log("=".repeat(64));
  const allPass = Object.values(results).every((r) => r.status === "PASS");
  if (allPass) {
    console.log("  ALL SYSTEMS OPERATIONAL");
  } else {
    const failing = Object.entries(results)
      .filter(([, r]) => r.status === "FAIL")
      .map(([name]) => name.toUpperCase());
    console.log(`  ISSUES FOUND IN: ${failing.join(", ")}`);
  }
  console.log("=".repeat(64));
  console.log("");
}

async function main() {
  console.log("Running integration health checks...\n");

  await checkEnvVars();
  await checkCloudinary();
  await checkRedis();
  await checkAlgolia();
  await checkSentry();

  printReport();
}

main().catch((err) => {
  console.error("Health check crashed:", err);
  process.exitCode = 1;
});
