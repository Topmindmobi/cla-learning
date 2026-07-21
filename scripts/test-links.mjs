#!/usr/bin/env node
/**
 * Smoke-test internal routes return 200 (or expected redirects).
 * Usage: node scripts/test-links.mjs [baseUrl]
 * Default: http://localhost:3000
 */

const base = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");

const routes = [
  { path: "/", expect: 200 },
  { path: "/catalog", expect: 200 },
  { path: "/login", expect: 200 },
  { path: "/register", expect: 200 },
  { path: "/about", expect: 200 },
  { path: "/contact", expect: 200 },
  { path: "/cips", expect: 200 },
  { path: "/acca", expect: 200 },
  { path: "/privacy", expect: 200 },
  { path: "/terms", expect: 200 },
  { path: "/privacy-policy", expect: [200, 301, 302, 307, 308] },
  { path: "/terms-conditions", expect: [200, 301, 302, 307, 308] },
  { path: "/dashboard", expect: [200, 307, 308] },
  { path: "/admin", expect: 200 },
  { path: "/instructor", expect: 200 },
  { path: "/courses/cips-level-4-diploma", expect: 200 },
  { path: "/courses/acca-applied-knowledge", expect: 200 },
  { path: "/api/health", expect: 200 },
];

function ok(code, expect) {
  const allowed = Array.isArray(expect) ? expect : [expect];
  return allowed.includes(code);
}

async function check(path, expect) {
  const url = `${base}${path}`;
  try {
    const res = await fetch(url, { redirect: "manual" });
    const pass = ok(res.status, expect);
    return { path, status: res.status, pass, url };
  } catch (e) {
    return { path, status: "ERR", pass: false, url, error: String(e) };
  }
}

async function main() {
  console.log(`Testing ${routes.length} routes at ${base}\n`);
  const results = [];
  for (const r of routes) {
    const result = await check(r.path, r.expect);
    results.push(result);
    console.log(`${result.pass ? "✓" : "✗"} ${result.status} ${r.path}`);
  }
  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  if (failed.length) {
    failed.forEach((f) => console.error(`  FAIL ${f.path} → ${f.status} ${f.error || ""}`));
    process.exit(1);
  }
}

main();
