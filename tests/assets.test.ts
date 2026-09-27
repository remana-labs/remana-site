import { readFileSync, existsSync } from "node:fs";
import { describe, it, expect } from "vitest";
const png = (p: string) => { const b = readFileSync(p); return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }; };
describe("brand assets", () => {
  it.each([["public/apple-touch-icon.png", 180, 180], ["public/icon-192.png", 192, 192], ["public/icon-512.png", 512, 512],
           ["public/maskable-512.png", 512, 512], ["public/og.png", 1280, 640], ["public/press/remana-icon-1024.png", 1024, 1024]])
    ("%s is %ix%i", (p, w, h) => { expect(existsSync(p), p).toBe(true); expect(png(p)).toEqual({ w, h }); });
  it("svg and ico and manifest exist", () => {
    for (const p of ["public/favicon.svg", "public/favicon.ico", "public/site.webmanifest", "public/press/remana-mark.svg"]) expect(existsSync(p), p).toBe(true);
    const m = JSON.parse(readFileSync("public/site.webmanifest", "utf8"));
    expect(m.icons.some((i: any) => i.purpose === "maskable")).toBe(true);
  });
});
