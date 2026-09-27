import { describe, it, expect } from "vitest";
import { normaliseEmail, parseWaitlistBody, verifyTurnstile, responseFor } from "../src/lib/waitlist";

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

describe("verifyTurnstile on a non-2xx siteverify", () => {
  it("is unavailable, not the user's fault", async () =>
    expect(await verifyTurnstile("s", "t", null, (async () => new Response(JSON.stringify({ success: false, "error-codes": ["internal-error"] }), { status: 502 })) as any)).toBe("unavailable"));
});

describe("responseFor", () => {
  const origin = "https://remana.ai";
  it("browsers are redirected to static pages, never shown JSON", () => {
    expect(responseFor("ok", true, origin)).toEqual({ status: 303, location: "https://remana.ai/joined" });
    for (const k of ["bad-email", "rejected", "unavailable", "too-large", "misconfigured", "storage"] as const)
      expect(responseFor(k, true, origin), k).toEqual({ status: 303, location: "https://remana.ai/not-joined" });
  });
  it("API clients get the status that names the cause", () => {
    expect(responseFor("ok", false, origin)).toEqual({ status: 200, body: { ok: true } });
    expect(responseFor("bad-email", false, origin).status).toBe(400);
    expect(responseFor("rejected", false, origin).status).toBe(400);
    expect(responseFor("too-large", false, origin).status).toBe(413);
    expect(responseFor("unavailable", false, origin).status).toBe(502);
    expect(responseFor("storage", false, origin).status).toBe(503);
    expect(responseFor("misconfigured", false, origin).status).toBe(500);
  });
});
