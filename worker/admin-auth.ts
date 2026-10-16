import type { Env } from "./index";

type Key = JsonWebKey & { kid?: string };
let cached: { domain: string; until: number; keys: Key[] } | undefined;
let fetching: Promise<Key[]> | undefined;
function decode(value: string) { return Uint8Array.from(atob(value.replace(/-/g, "+").replace(/_/g, "/")), char => char.charCodeAt(0)); }
async function keys(domain: string) {
  if (cached?.domain === domain && cached.until > Date.now()) return cached.keys;
  if (!fetching) fetching = (async () => {
    const response = await fetch(`https://${domain}/cdn-cgi/access/certs`, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error("Access keys unavailable");
    const data = await response.json() as { keys: Key[] };
    if (!Array.isArray(data.keys)) throw new Error("Invalid Access keys");
    cached = { domain, until: Date.now() + 3600000, keys: data.keys };
    return data.keys;
  })().finally(() => { fetching = undefined; });
  return fetching;
}
export async function adminIdentity(request: Request, env: Env): Promise<{ email: string } | { error: string; status: number }> {
  const host = new URL(request.url).hostname;
  let email: string;
  if (env.ADMIN_DEV_EMAIL && (host === "localhost" || host === "127.0.0.1")) email = env.ADMIN_DEV_EMAIL;
  else {
    if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) return { status: 503, error: "Admin sign-in isn't set up yet." };
    try {
      if (!/^[a-z0-9-]+\.cloudflareaccess\.com$/i.test(env.ACCESS_TEAM_DOMAIN)) throw new Error("Invalid team domain");
      const token = request.headers.get("Cf-Access-Jwt-Assertion") || request.headers.get("Cookie")?.split(";").map(part => part.trim()).find(part => part.startsWith("CF_Authorization="))?.slice(17);
      if (!token || token.length > 20000) throw new Error("Missing token");
      const parts = token.split(".");
      if (parts.length !== 3) throw new Error("Invalid token");
      const header = JSON.parse(new TextDecoder().decode(decode(parts[0])));
      const claims = JSON.parse(new TextDecoder().decode(decode(parts[1])));
      if (header.alg !== "RS256" || typeof header.kid !== "string") throw new Error("Invalid algorithm");
      const jwk = (await keys(env.ACCESS_TEAM_DOMAIN)).find(key => key.kid === header.kid && key.kty === "RSA");
      if (!jwk) throw new Error("Unknown key");
      const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
      if (!await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, decode(parts[2]), new TextEncoder().encode(`${parts[0]}.${parts[1]}`))) throw new Error("Invalid signature");
      const now = Date.now() / 1000;
      if (claims.iss !== `https://${env.ACCESS_TEAM_DOMAIN}` || typeof claims.exp !== "number" || !Number.isFinite(claims.exp) || claims.exp <= now || (claims.nbf !== undefined && (typeof claims.nbf !== "number" || claims.nbf > now)) || !(Array.isArray(claims.aud) ? claims.aud : [claims.aud]).includes(env.ACCESS_AUD) || typeof claims.email !== "string" || !claims.email.trim()) throw new Error("Invalid claims");
      email = claims.email;
    } catch { return { status: 403, error: "Please sign in with an authorised staff account." }; }
  }
  if (env.ADMIN_EMAILS && !env.ADMIN_EMAILS.split(",").map(value => value.trim().toLowerCase()).includes(email.toLowerCase())) return { status: 403, error: "This account cannot access the admin panel." };
  return { email };
}
