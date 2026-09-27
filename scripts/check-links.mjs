import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
const dist = "dist"; const files = [];
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : p.endsWith(".html") && files.push(p); } })(dist);
if (files.length === 0) { console.error("no html in dist/ — run the build first"); process.exit(1); }
const broken = [];
for (const f of files) for (const m of readFileSync(f, "utf8").matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
  const p = join(dist, m[1]); if (!(existsSync(p) || existsSync(join(p, "index.html")) || existsSync(p + ".html"))) broken.push(`${f} -> ${m[1]}`);
}
if (broken.length) { console.error("broken internal links:\n" + broken.join("\n")); process.exit(1); }
console.log(`links ok across ${files.length} pages`);
