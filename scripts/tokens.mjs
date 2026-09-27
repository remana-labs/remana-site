import { readFileSync, writeFileSync } from "node:fs";
const t = JSON.parse(readFileSync("src/styles/tokens.json", "utf8"));
const lines = [`/* generated from src/styles/tokens.json (${t.source}) — do not edit */`, ":root {"];
for (const [k, v] of Object.entries(t.colors)) lines.push(`  --color-${k}: ${v};`);
for (const [k, v] of Object.entries(t.spacing)) lines.push(`  --space-${k}: ${v};`);
for (const [k, v] of Object.entries(t.rounded)) lines.push(`  --radius-${k}: ${v};`);
lines.push("}");
writeFileSync("src/styles/tokens.css", lines.join("\n") + "\n");
