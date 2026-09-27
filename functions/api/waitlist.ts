import { normaliseEmail, parseWaitlistBody, verifyTurnstile } from "../../src/lib/waitlist";

interface Env { DB: D1Database; TURNSTILE_SECRET: string }

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const text = await request.text();
  if (text.length > 4096) return json(413, { ok: false, error: "too large" });
  const { email: raw, token, source } = parseWaitlistBody(request.headers.get("content-type"), text);
  const email = raw ? normaliseEmail(raw) : null;
  if (!email) return json(400, { ok: false, error: "email" });
  const verdict = await verifyTurnstile(env.TURNSTILE_SECRET, token ?? "", request.headers.get("cf-connecting-ip"), fetch);
  if (verdict === "unavailable") return json(502, { ok: false, error: "verification unavailable, try again" });
  if (verdict === "rejected") return json(400, { ok: false, error: "verification" });
  // INSERT OR IGNORE: a repeat signup is a success with no new row, never an error that leaks membership.
  await env.DB.prepare("INSERT OR IGNORE INTO waitlist (email, source) VALUES (?1, ?2)").bind(email, source.slice(0, 200)).run();
  const wantsHtml = (request.headers.get("accept") ?? "").includes("text/html");
  return wantsHtml ? Response.redirect(new URL("/joined", request.url).toString(), 303) : json(200, { ok: true });
};
