#!/usr/bin/env node
/**
 * Verify Supabase connection after .env.local is configured.
 * Usage: node scripts/verify-supabase.mjs
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");

function loadEnv() {
  if (!existsSync(envPath)) {
    console.error("Missing .env.local — run: npm run setup:cloud");
    process.exit(1);
  }
  const env = {};
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

async function main() {
  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url.includes("YOUR_PROJECT")) {
    console.error("Supabase keys not set in .env.local");
    process.exit(1);
  }

  const res = await fetch(`${url}/rest/v1/`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });

  if (res.ok || res.status === 200 || res.status === 404) {
    console.log("✓ Supabase API reachable:", url);

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(url, key);
    const { error } = await supabase.from("courses").select("id").limit(1);

    if (error?.code === "42P01") {
      console.log("⚠ Database schema not applied yet — run 001_core_schema.sql in Supabase SQL Editor");
    } else if (error) {
      console.log("⚠ Query check:", error.message);
    } else {
      console.log("✓ Database schema looks good (courses table exists)");
    }
    return;
  }

  console.error("✗ Could not reach Supabase:", res.status, await res.text());
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
