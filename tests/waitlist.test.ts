import { describe, it, expect } from "vitest";
import { normaliseEmail, parseWaitlistBody, verifyTurnstile } from "../src/lib/waitlist";

describe("normaliseEmail", () => {
  it("trims and lowercases", () => expect(normaliseEmail("  Reza@Example.com ")).toBe("reza@example.com"));
  it("rejects junk", () => { for (const s of ["", "reza", "reza@", "@x.y", "a b@c.d", "x".repeat(250) + "@a.io"]) expect(normaliseEmail(s), s).toBeNull(); });
});

describe("parseWaitlistBody", () => {
  it("reads JSON", () => expect(parseWaitlistBody("application/json", JSON.stringify({ email: "a@b.co", token: "t", source: "/" })))
    .toEqual({ email: "a@b.co", token: "t", source: "/" }));
  it("reads a plain form post (the no-JS path)", () => expect(parseWaitlistBody("application/x-www-form-urlencoded", "email=a%40b.co&cf-turnstile-response=t&source=%2F"))
    .toEqual({ email: "a@b.co", token: "t", source: "/" }));
  it("does not throw on garbage", () => expect(parseWaitlistBody("application/json", "{not json")).toEqual({ email: null, token: null, source: "" }));
  it("rejects other content types", () => expect(parseWaitlistBody("text/plain", "email=a@b.co")).toEqual({ email: null, token: null, source: "" }));
});

describe("verifyTurnstile", () => {
  const respond = (body: unknown) => async () => new Response(JSON.stringify(body), { status: 200 });
  it("ok on success", async () => expect(await verifyTurnstile("s", "t", null, respond({ success: true }) as any)).toBe("ok"));
  it("rejected on failure", async () => expect(await verifyTurnstile("s", "t", null, respond({ success: false, "error-codes": ["invalid-input-response"] }) as any)).toBe("rejected"));
  it("unavailable when siteverify cannot be reached", async () => expect(await verifyTurnstile("s", "t", null, (async () => { throw new Error("ECONNRESET"); }) as any)).toBe("unavailable"));
  it("rejected without a token, without calling out", async () => { let called = 0; expect(await verifyTurnstile("s", "", null, (async () => { called++; return new Response("{}"); }) as any)).toBe("rejected"); expect(called).toBe(0); });
});
