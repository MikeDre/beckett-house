import type { Env } from "./index";

function base64url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function encode(value: object) {
  return base64url(new TextEncoder().encode(JSON.stringify(value)));
}

export async function appendSheetRow(env: Env, spreadsheetId: string | undefined, row: string[]) {
  if (!spreadsheetId) {
    console.warn("Form spreadsheet is not configured; skipping append.");
    return;
  }
  if (!env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !env.GOOGLE_PRIVATE_KEY) {
    throw new Error("Google service-account credentials are not configured.");
  }
  const pem = env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n").replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, "");
  const key = await crypto.subtle.importKey("pkcs8", Uint8Array.from(atob(pem), (char) => char.charCodeAt(0)), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({ iss: env.GOOGLE_SERVICE_ACCOUNT_EMAIL, scope: "https://www.googleapis.com/auth/spreadsheets", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 })}`;
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsigned));
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${base64url(new Uint8Array(signature))}` }),
    signal: AbortSignal.timeout(15000),
  });
  if (!tokenResponse.ok) throw new Error(`Google authentication failed (${tokenResponse.status}).`);
  const token = await tokenResponse.json() as { access_token?: string };
  if (!token.access_token) throw new Error("Google authentication returned no access token.");
  // USER_ENTERED preserves dates, but user text must never become a formula.
  const values = row.map((value) => /^[=+\-@]/.test(value.trimStart()) ? `'${value}` : value);
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ majorDimension: "ROWS", values: [values] }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Google Sheets append failed (${response.status}).`);
}
