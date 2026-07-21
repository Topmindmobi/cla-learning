#!/usr/bin/env node
/**
 * Push project files to GitHub via API (no local git required).
 * Usage: GITHUB_TOKEN=ghp_xxx node scripts/push-github.mjs
 *
 * Create token: https://github.com/settings/tokens/new?scopes=repo&description=cla-learning-deploy
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const token = process.env.GITHUB_TOKEN;
const owner = process.env.GITHUB_OWNER || "Topmindmobi";
const repo = process.env.GITHUB_REPO || "cla-learning";
const branch = "main";

const SKIP = new Set(["node_modules", ".next", ".git", ".vercel"]);
const SKIP_EXT = [".zip"];

if (!token) {
  console.error("Set GITHUB_TOKEN first.");
  console.error("Create one: https://github.com/settings/tokens/new?scopes=repo");
  process.exit(1);
}

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, files);
    else if (!SKIP_EXT.some((e) => name.endsWith(e))) files.push(full);
  }
  return files;
}

async function gh(path, opts = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  if (!res.ok) throw new Error(`${res.status} ${path}: ${typeof data === "string" ? data : data.message}`);
  return data;
}

async function main() {
  const files = walk(root);
  console.log(`Uploading ${files.length} files to ${owner}/${repo}…`);

  const blobs = [];
  for (const file of files) {
    const path = relative(root, file).replace(/\\/g, "/");
    const content = readFileSync(file).toString("base64");
    const blob = await gh(`/repos/${owner}/${repo}/git/blobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, encoding: "base64" }),
    });
    blobs.push({ path, sha: blob.sha, mode: "100644", type: "blob" });
    process.stdout.write(`  ${path}\n`);
  }

  const tree = await gh(`/repos/${owner}/${repo}/git/trees`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tree: blobs }),
  });

  let parentSha;
  try {
    const ref = await gh(`/repos/${owner}/${repo}/git/ref/heads/${branch}`);
    parentSha = ref.object.sha;
  } catch {
    parentSha = null;
  }

  const commit = await gh(`/repos/${owner}/${repo}/git/commits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Initial deploy — CLA Learning Next.js app",
      tree: tree.sha,
      ...(parentSha ? { parents: [parentSha] } : {}),
    }),
  });

  if (parentSha) {
    await gh(`/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sha: commit.sha }),
    });
  } else {
    await gh(`/repos/${owner}/${repo}/git/refs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: commit.sha }),
    });
  }

  console.log(`\n✓ Pushed to https://github.com/${owner}/${repo}`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
