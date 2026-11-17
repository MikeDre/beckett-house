export const SESSION_COOKIE = "beckett-preview-session";
export const SESSION_SECONDS = 60 * 60 * 8;
const encoder = new TextEncoder();
async function key(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}
function hex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
export async function issueSession(secret: string, now = Date.now()) {
  const expires = String(now + SESSION_SECONDS * 1000);
  const signature = hex(
    await crypto.subtle.sign(
      "HMAC",
      await key(secret),
      encoder.encode(expires),
    ),
  );
  return `${expires}.${signature}`;
}
export async function validSession(
  value: string | undefined,
  secret: string,
  now = Date.now(),
) {
  if (!value || !secret) return false;
  const [expires, signature, ...extra] = value.split(".");
  if (
    extra.length ||
    !/^\d{13}$/.test(expires) ||
    !/^[a-f0-9]{64}$/.test(signature || "") ||
    Number(expires) <= now ||
    Number(expires) > now + SESSION_SECONDS * 1000
  )
    return false;
  const bytes = Uint8Array.from(signature.match(/../g)!, (s) =>
    parseInt(s, 16),
  );
  return crypto.subtle.verify(
    "HMAC",
    await key(secret),
    bytes,
    encoder.encode(expires),
  );
}
export function safeRedirect(value: string | undefined) {
  return value?.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\") &&
    !/[\r\n]/.test(value)
    ? value
    : "/";
}
