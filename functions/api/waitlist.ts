import { normaliseEmail, parseWaitlistBody, verifyTurnstile, responseFor, type Outcome } from "../../src/lib/waitlist";

interface Env { DB: D1Database; TURNSTILE_SECRET?: string }

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const wantsHtml = (request.headers.get("accept") ?? "").includes("text/html");
  const origin = new URL(request.url).origin;
  const reply = (kind: Outcome) => {
    const r = responseFor(kind, wantsHtml, origin);
    return r.location
      ? Response.redirect(r.location, r.status)
      : new Response(JSON.stringify(r.body), { status: r.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
  };

  if (!env.TURNSTILE_SECRET) { console.error("TURNSTILE_SECRET is not set"); return reply("misconfigured"); }
  const text = await request.text();
  if (text.length > 4096) return reply("too-large");
  const { email: raw, token, source } = parseWaitlistBody(request.headers.get("content-type"), text);
  const email = raw ? normaliseEmail(raw) : null;
  if (!email) return reply("bad-email");
  const verdict = await verifyTurnstile(env.TURNSTILE_SECRET, token ?? "", request.headers.get("cf-connecting-ip"), fetch);
  if (verdict !== "ok") return reply(verdict);
  try {
    // INSERT OR IGNORE: a repeat signup is a success with no new row, never an error that leaks membership.
    await env.DB.prepare("INSERT OR IGNORE INTO waitlist (email, source) VALUES (?1, ?2)").bind(email, source.slice(0, 200)).run();
  } catch (e) {
    console.error("waitlist insert failed", e);
    return reply("storage");
  }
  return reply("ok");
};
