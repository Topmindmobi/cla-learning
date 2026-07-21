#!/usr/bin/env node
/**
 * Package cla-learning for GitHub upload (no git required).
 * Output: ~/Projects/cla-learning-deploy.zip
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(dirname(root), "cla-learning-deploy.zip");

execSync(
  `zip -r "${out}" . -x "node_modules/*" -x ".next/*" -x ".git/*" -x "*.zip"`,
  { cwd: root, stdio: "inherit" },
);

console.log(`\n✓ Deploy package: ${out}`);
console.log(`
Next — get this on GitHub (Render needs a repo):

  1. https://github.com/new
     Name: cla-learning  |  Private or Public

  2. Unzip ${out}
     Drag the folder contents into GitHub → "uploading an existing file"

  3. https://dashboard.render.com/select-repo?type=blueprint
     Search: cla-learning → Connect

  4. Render will read render.yaml and create the web service.
     Add env vars when prompted:
       NEXT_PUBLIC_SUPABASE_URL
       NEXT_PUBLIC_SUPABASE_ANON_KEY
       NEXT_PUBLIC_APP_URL = https://cla-learning.onrender.com
`);

if (!existsSync(out)) process.exit(1);
