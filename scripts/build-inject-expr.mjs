import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const b64 = readFileSync(join(root, "scripts/data/m005.b64"), "utf8").trim();
const expr = `(() => {
  const sql = atob(${JSON.stringify(b64)});
  const ed = window.monaco?.editor?.getEditors?.()?.[0];
  if (ed) { ed.setValue(sql); return { ok:true, via:'monaco', len: sql.length }; }
  const ta = document.querySelector('textarea.inputarea') || document.querySelector('[aria-label="Editor content"]');
  if (ta) {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
    setter.call(ta, sql);
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    return { ok:true, via:'textarea', len: sql.length };
  }
  return { ok:false };
})()`;
writeFileSync(join(root, "scripts/data/inject-expr.js"), expr);
console.log("expr bytes", expr.length);
