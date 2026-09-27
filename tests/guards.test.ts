import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";

describe("privacy policy change log", () => {
  it("has a dated entry no older than the file's last commit", () => {
    const md = readFileSync("src/pages/privacy.md", "utf8");
    const dates = [...md.matchAll(/^- \*\*(\d{4}-\d{2}-\d{2})\*\*/gm)].map((m) => m[1]);
    expect(dates.length, "no change-log entries found").toBeGreaterThan(0);
    const latest = dates.sort().at(-1)!;
    const committed = execSync("git log -1 --format=%cs -- src/pages/privacy.md").toString().trim() || latest;
    expect(latest >= committed, `policy edited ${committed} but last change-log entry is ${latest}`).toBe(true);
  });
});

describe("well-known files", () => {
  it("are served as JSON", () => {
    const headers = readFileSync("public/_headers", "utf8");
    expect(headers).toContain("/.well-known/apple-app-site-association");
    expect(headers).toContain("Content-Type: application/json");
    JSON.parse(readFileSync("public/.well-known/assetlinks.json", "utf8"));
    JSON.parse(readFileSync("public/.well-known/apple-app-site-association", "utf8"));
  });
});
