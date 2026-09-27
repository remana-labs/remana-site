const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normaliseEmail(raw: string): string | null {
  const e = raw.trim().toLowerCase();
  return e.length > 0 && e.length <= 254 && EMAIL.test(e) ? e : null;
}

export function parseWaitlistBody(contentType: string | null, text: string) {
  const none = { email: null as string | null, token: null as string | null, source: "" };
  const ct = (contentType ?? "").split(";")[0].trim();
  try {
    if (ct === "application/json") {
      const j = JSON.parse(text);
      return { email: str(j.email), token: str(j.token), source: str(j.source) ?? "" };
    }
    if (ct === "application/x-www-form-urlencoded") {
      const p = new URLSearchParams(text);
      return { email: p.get("email"), token: p.get("cf-turnstile-response"), source: p.get("source") ?? "" };
    }
  } catch { /* malformed body: fall through to none */ }
  return none;
}
const str = (v: unknown) => (typeof v === "string" ? v : null);

export async function verifyTurnstile(secret: string, token: string, ip: string | null, fetchFn: typeof fetch): Promise<"ok" | "rejected" | "unavailable"> {
  if (!token) return "rejected";
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);
  try {
    const r = await fetchFn("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const j = (await r.json()) as { success?: boolean };
    return j.success ? "ok" : "rejected";
  } catch {
    return "unavailable";
  }
}
