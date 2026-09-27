import { readFileSync, existsSync } from "node:fs";
import { describe, it, expect } from "vitest";

const tokens = JSON.parse(readFileSync("src/styles/tokens.json", "utf8"));

describe("design tokens", () => {
  it("carry every key the pages use, as valid values", () => {
    // Precondition: an empty file would pass a loop over nothing.
    expect(Object.keys(tokens.colors).length).toBeGreaterThan(30);
    for (const [k, v] of Object.entries<string>(tokens.colors)) {
      expect(v, k).toMatch(/^#[0-9A-F]{6}$/);
    }
    for (const group of ["spacing", "rounded"]) {
      for (const [k, v] of Object.entries<string>(tokens[group])) expect(v, `${group}.${k}`).toMatch(/^\d+px$/);
    }
    expect(tokens.colors["teal-dark"]).toBe("#2DD4BF");
    expect(tokens.colors["bg-dark"]).toBe("#0B0D0E");
    expect(tokens.source).toMatch(/^remana-labs\/remana@[0-9a-f]{8} DESIGN\.md$/);
  });

  it("generated CSS is committed and current", () => {
    expect(existsSync("src/styles/tokens.css")).toBe(true);
    const css = readFileSync("src/styles/tokens.css", "utf8");
    for (const k of Object.keys(tokens.colors)) expect(css).toContain(`--color-${k}:`);
    for (const k of Object.keys(tokens.spacing)) expect(css).toContain(`--space-${k}:`);
    for (const k of Object.keys(tokens.rounded)) expect(css).toContain(`--radius-${k}:`);
  });
});
