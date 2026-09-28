import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";

describe("privacy policy", () => {
  it("does not claim more than the servers do today (spec: the three facts)", () => {
    const md = readFileSync("src/pages/privacy.md", "utf8");
    // Forbidden until vLLM runs with --disable-log-requests (spec → "Three facts", item 1).
    expect(md).not.toContain("No transcript and no memory is stored on our servers");
    expect(md).not.toContain("keep nothing after it");
    // The caveat that makes the page true today must be there instead.
    expect(md).toMatch(/request logs/i);
  });
  it("is checked against real history, not a shallow clone", () => {
    // In a depth-1 clone `git log -1 -- file` returns HEAD's date for every file, so the
    // change-log guard below would pass or fail by accident. Refuse to run shallow.
    expect(execSync("git rev-parse --is-shallow-repository").toString().trim()).toBe("false");
  });
});

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

describe("CI deploy", () => {
  const yml = readFileSync(".github/workflows/ci.yml", "utf8");
  it("runs on GitHub-hosted runners only (public repo)", () => {
    expect(yml).toContain("ubuntu-latest");
    expect(yml).not.toMatch(/runs-on:\s*self-hosted/);
  });
  it("deploys the tested build to Pages on push to main, never on a pull request", () => {
    expect(yml).toMatch(/wrangler pages deploy dist --project-name remana-site --branch main/);
    expect(yml).toMatch(/if: github\.event_name == 'push'/);
  });
  it("builds with the real Turnstile site key, so the deployed form is not the always-pass widget", () => {
    expect(yml).toContain("PUBLIC_TURNSTILE_SITE_KEY: 0x4AAAAAAFFBWo8mbSSlV_Qw");
    expect(yml).not.toContain("1x00000000000000000000AA");
  });
});
