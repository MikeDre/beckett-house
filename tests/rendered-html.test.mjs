import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { register } from "node:module";

register(`data:text/javascript,${encodeURIComponent(`
  export function resolve(specifier, context, nextResolve) {
    if (specifier === "cloudflare:workers") return { url: "data:text/javascript,export const env = {};", shortCircuit: true };
    return nextResolve(specifier, context);
  }
`)}`, import.meta.url);

async function render(pathname = "/", origin = "http://localhost", bindings = {}, init = {}, background = []) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`${origin}${pathname}`, {
      headers: { accept: "text/html" },
      redirect: "manual",
      ...init,
    }),
    {
      ...bindings,
      ASSETS: bindings.ASSETS ?? {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil(promise) { background.push(promise); },
      passThroughOnException() {},
    },
  );
}

test("server-renders the homepage nursery chooser", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Montessori Nursery in Angel &amp; Abbey Road \| Beckett House<\/title>/);
  assert.match(html, /<link rel="canonical" href="https:\/\/www\.beckett-house\.co\.uk\/?"/);
  assert.match(html, /google-site-verification/);
  assert.match(html, /EducationalOrganization/);
  assert.doesNotMatch(html, /Switch schools here/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});

test("nursery pages name the location and publish answer-ready local data", async () => {
  for (const [path, heading] of [["/angel", /Montessori nursery in Angel, Islington/], ["/abbey-road", /Our new Montessori nursery on Abbey Road, NW8/]]) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.match(html, new RegExp(`<h1[^>]*>\\s*<span>${heading.source}`), path);
    assert.match(html, /"@type":"ChildCare"/, path);
    assert.match(html, /GeoCoordinates/, path);
    assert.match(html, /OpeningHoursSpecification/, path);
    assert.match(html, /tourBookingPage/, path);
    assert.match(html, /FAQPage/, path);
    // Photos go through the responsive image endpoint so phones get smaller copies.
    assert.match(html, /srcSet="\/_next\/image\?url=%2Fimages%2F/, path);
  }
});

test("old Wix addresses redirect permanently to their new pages", async () => {
  for (const [from, to] of [
    ["/abbeyroad/home-ar", "/abbey-road"],
    ["/Registration/", "/register"],
    ["/calendar", "/timetable"],
    ["/registration-form", "/register?location=angel"],
  ]) {
    const response = await render(from);
    assert.equal(response.status, 301, from);
    assert.equal(new URL(response.headers.get("location")).pathname + new URL(response.headers.get("location")).search, to, from);
  }
});

test("plain http is upgraded to https", async () => {
  const response = await render("/angel", "http://www.beckett-house.co.uk");
  assert.equal(response.status, 301);
  assert.equal(response.headers.get("location"), "https://www.beckett-house.co.uk/angel");
});

test("the bare domain redirects to www", async () => {
  const response = await render("/faq?x=1", "https://beckett-house.co.uk");
  assert.equal(response.status, 301);
  assert.equal(response.headers.get("location"), "https://www.beckett-house.co.uk/faq?x=1");
});

test("unknown pages return the 404 page", async () => {
  const response = await render("/this-page-does-not-exist");
  assert.equal(response.status, 404);
  assert.match(await response.text(), /Sorry, we can’t find that page/);
});

test("both image routes serve responsive copies and reject non-local paths", async () => {
  for (const route of ["/_next/image", "/_vinext/image"]) {
    for (const url of ["%2F..%2Fworker%2Findex.ts", "https%3A%2F%2Fexample.com%2Fa.jpg"]) {
      assert.equal((await render(`${route}?url=${url}&w=640`)).status, 400);
    }
    const paths = [];
    const response = await render(`${route}?url=%2Fimages%2Flearning-room.webp&w=640`, "http://localhost", {
      ASSETS: { fetch: async request => {
        paths.push(new URL(request.url).pathname);
        return new Response("image bytes", { headers: { "Content-Type": "image/webp" } });
      } },
    });
    assert.equal(response.status, 200);
    assert.deepEqual(paths, ["/_responsive/images/learning-room-640.webp"]);
    assert.equal(response.headers.get("content-type"), "image/webp");
    assert.match(response.headers.get("cache-control"), /max-age=2592000/);
  }
});

test("privacy notice is published and linked from the forms", async () => {
  const privacy = await render("/privacy");
  assert.equal(privacy.status, 200);
  const html = await privacy.text();
  assert.match(html, /Beckett House Limited/);
  assert.match(html, /bh_analytics_consent/);
  for (const path of ["/visit", "/register"]) {
    assert.match(await (await render(path)).text(), /href="\/privacy"/, path);
  }
});

test("provides crawler and AI discovery files", async () => {
  const [robotsResponse, sitemapResponse, llms] = await Promise.all([
    render("/robots.txt"),
    render("/sitemap.xml"),
    readFile(new URL("../public/llms.txt", import.meta.url), "utf8"),
  ]);

  assert.equal(robotsResponse.status, 200);
  assert.match(await robotsResponse.text(), /OAI-SearchBot/);
  assert.equal(sitemapResponse.status, 200);
  const sitemap = await sitemapResponse.text();
  for (const path of ["/angel", "/abbey-road", "/visit", "/privacy"]) {
    assert.match(sitemap, new RegExp(`<loc>https://www\\.beckett-house\\.co\\.uk${path}</loc>`), path);
  }
  assert.doesNotMatch(sitemap, /thank-you/);
  assert.match(llms, /Beckett House Montessori/);
  assert.match(llms, /Current availability, fees and funding arrangements/);
});

test("admin pages and API fail closed without authentication", async () => {
  for (const path of ["/admin", "/admin/anything", "/admin/preview/home", "/admin/preview/angel", "/admin/preview/abbey-road", "/api/admin/me", "/api/admin/pages/home", "/%61dmin", "/%2561dmin", "/api/%61dmin/me", "/Admin"]) {
    const response = await render(path);
    assert.ok([403, 503].includes(response.status), path);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(response.headers.get("x-robots-tag"), "noindex");
  }
});

test("robots excludes admin and API and sitemap excludes admin", async () => {
  const robots = await (await render("/robots.txt")).text();
  assert.match(robots, /Disallow: \/admin/);
  assert.match(robots, /Disallow: \/api\//);
  assert.doesNotMatch(await (await render("/sitemap.xml")).text(), /\/admin/);
});

test("default fees and announcements survive unavailable admin storage", async () => {
  const fees = await (await render("/opening-hours-fees")).text();
  assert.match(fees, /£(?:<!-- -->)?75/);
  assert.match(fees, /8am–1pm/);
  for (const path of ["/angel", "/abbey-road"]) {
    assert.match(await (await render(path)).text(), /Meet Robot NAO and our interactive learning table/);
  }
});

test("local bypass is restricted to loopback and all mutations require same-origin JSON", async () => {
  const bindings = { ADMIN_DEV_EMAIL: "staff@example.invalid" };
  assert.equal((await render("/api/admin/me", "http://localhost", bindings)).status, 200);
  assert.equal((await render("/api/admin/me", "http://127.0.0.1", bindings)).status, 200);
  assert.equal((await render("/api/admin/me", "https://example.workers.dev", bindings)).status, 503);
  assert.equal((await render("/api/admin/me", "http://localhost", { ...bindings, ADMIN_EMAILS: "other@example.invalid" })).status, 403);
  for (const [headers, status] of [[{ "Content-Type": "application/json" }, 403], [{ Origin: "https://elsewhere.invalid", "Content-Type": "application/json" }, 403], [{ Origin: "http://localhost", "Content-Type": "text/plain" }, 415]]) {
    assert.equal((await render("/api/admin/announcements", "http://localhost", bindings, { method: "PUT", headers, body: "[]" })).status, status);
  }
  assert.equal((await render("/api/admin/announcements", "http://localhost", bindings, { method: "PUT", headers: { Origin: "http://localhost", "Content-Type": "application/json" }, body: JSON.stringify(["x".repeat(205000)]) })).status, 413);
});

test("Access verifies RSA signature, issuer, audience, expiry, cookie and allowlist", async () => {
  const pair = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
  const jwk = await crypto.subtle.exportKey("jwk", pair.publicKey);
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async url => {
    assert.equal(String(url), "https://test-team.cloudflareaccess.com/cdn-cgi/access/certs");
    return Response.json({ keys: [{ ...jwk, kid: "test-key" }] });
  };
  const bindings = { ACCESS_TEAM_DOMAIN: "test-team.cloudflareaccess.com", ACCESS_AUD: "test-aud", ADMIN_EMAILS: "STAFF@example.invalid" };
  async function token(overrides = {}, header = {}) {
    const encode = value => Buffer.from(JSON.stringify(value)).toString("base64url");
    const message = `${encode({ alg: "RS256", kid: "test-key", ...header })}.${encode({ email: "staff@example.invalid", iss: "https://test-team.cloudflareaccess.com", aud: ["test-aud"], exp: Math.floor(Date.now() / 1000) + 300, ...overrides })}`;
    const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", pair.privateKey, new TextEncoder().encode(message));
    return `${message}.${Buffer.from(signature).toString("base64url")}`;
  }
  try {
    const valid = await token();
    assert.equal((await render("/api/admin/me", "https://example.workers.dev", bindings, { headers: { "Cf-Access-Jwt-Assertion": valid } })).status, 200);
    assert.equal((await render("/api/admin/me", "https://example.workers.dev", bindings, { headers: { Cookie: `other=1; CF_Authorization=${valid}; next=2` } })).status, 200);
    for (const invalid of [await token({ exp: 1 }), await token({ aud: ["wrong"] }), await token({ iss: "https://wrong.invalid" }), await token({ email: "other@example.invalid" }), await token({}, { alg: "none" }), `${valid.slice(0, -10)}AAAAAAAAAA`]) {
      assert.equal((await render("/api/admin/me", "https://example.workers.dev", bindings, { headers: { "Cf-Access-Jwt-Assertion": invalid } })).status, 403);
    }
  } finally { globalThis.fetch = originalFetch; }
});

test("successful forms store submissions in the background and honour recipient overrides", async () => {
  const originalFetch = globalThis.fetch;
  const emails = [], inserts = [], sheetRows = [];
  const pair = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
  const privateKey = Buffer.from(await crypto.subtle.exportKey("pkcs8", pair.privateKey)).toString("base64");
  globalThis.fetch = async (url, init) => {
    if (String(url).includes("turnstile")) return Response.json({ success: true });
    if (String(url).includes("oauth2.googleapis.com")) return Response.json({ access_token: "test-token" });
    if (String(url).includes("sheets.googleapis.com")) {
      sheetRows.push({ url: String(url), ...JSON.parse(init.body) });
      return Response.json({ updates: { updatedRows: 1 } });
    }
    assert.equal(String(url), "https://api.resend.com/emails");
    emails.push(JSON.parse(init.body));
    return Response.json({ id: "test" });
  };
  const bindings = {
    FORM_SHEET_ID: "test-sheet", GOOGLE_SERVICE_ACCOUNT_EMAIL: "test@example.invalid", GOOGLE_PRIVATE_KEY: privateKey,
    RESEND_API_KEY: "test", FORM_FROM_EMAIL: "test@example.invalid", TURNSTILE_SECRET_KEY: "test", FORM_BCC: "legacy@example.invalid",
    DB: { prepare(sql) { return { bind(...values) { return { first: async () => ({ value: JSON.stringify({ copies: { all: ["copy@example.invalid"], angel: ["copy@example.invalid", "angel@example.invalid"], "abbey-road": [] } }) }), run: async () => { inserts.push({ sql, values }); } }; } }; } },
  };
  try {
    for (const kind of ["visit", "register"]) {
      const background = [];
      const payload = { location: "Angel", nursery: "angel", email: "family@example.invalid", name: "Test parent", phone: "020 7946 0123", childAge: "3", turnstileToken: "test", childName: "Test child", dateOfBirth: "2023-01-01", motherName: "Test parent", motherMobile: "00000", fatherName: "Test parent", fatherMobile: "00000", startDate: "2027-01-01" };
      const response = await render(`/api/forms/${kind}`, "http://localhost", bindings, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }, background);
      assert.equal(response.status, 200);
      await Promise.all(background);
      assert.equal(inserts.at(-1).values[1], kind);
      assert.equal(inserts.at(-1).values[2], "angel");
      assert.ok(Array.isArray(JSON.parse(inserts.at(-1).values[5])));
      if (kind === "visit") {
        assert.deepEqual(sheetRows.at(-1).values[0].slice(1), ["Test parent", "family@example.invalid", "Angel", "3", "Not provided", "'020 7946 0123"]);
        assert.match(emails.at(-2).text, /Phone number: 020 7946 0123/);
        assert.match(emails.at(-1).html, /020 7946 0123/);
        assert.ok(JSON.parse(inserts.at(-1).values[5]).some(([label, value]) => label === "Phone number" && value === "020 7946 0123"));
      }
      assert.deepEqual(emails.at(-2).bcc, ["copy@example.invalid", "angel@example.invalid"]);
    }
    bindings.DB.prepare = () => { throw new Error("Storage unavailable"); };
    const background = [];
    const response = await render("/api/forms/visit", "http://localhost", bindings, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ location: "Angel", email: "family@example.invalid", name: "Test parent", phone: "020 7946 0123", childAge: "3", turnstileToken: "test" }) }, background);
    assert.equal(response.status, 200);
    await Promise.all(background);
    assert.deepEqual(emails.at(-2).bcc, ["legacy@example.invalid"]);
  } finally { globalThis.fetch = originalFetch; }
});


test("authenticated staff workspace and homepage preview remain private", async () => {
  const bindings = { ADMIN_DEV_EMAIL: "staff@example.invalid" };
  const workspace = await render("/admin", "http://localhost", bindings);
  assert.equal(workspace.status, 200);
  assert.equal(workspace.headers.get("cache-control"), "no-store");
  assert.equal(workspace.headers.get("x-robots-tag"), "noindex");
  const html = await workspace.text();
  assert.match(html, /CMS navigation/);
  assert.match(html, /Pages/);
  assert.match(html, /Skip to workspace content/);
  const preview = await render("/admin/preview/home", "http://localhost", bindings);
  assert.equal(preview.status, 200);
  assert.equal(preview.headers.get("cache-control"), "no-store");
  assert.equal(preview.headers.get("x-robots-tag"), "noindex");
  assert.match(await preview.text(), /Beckett House Montessori nurseries/);
});


test("nursery draft previews render privately for both pages", async () => {
  for (const slug of ["angel", "abbey-road"]) {
    const preview = await render(`/admin/preview/${slug}`, "http://localhost", { ADMIN_DEV_EMAIL: "staff@example.invalid" });
    assert.equal(preview.status, 200);
    assert.equal(preview.headers.get("cache-control"), "no-store");
    assert.equal(preview.headers.get("x-robots-tag"), "noindex");
    const html = await preview.text();
    assert.match(html, /(?:home|abbey-road)-hero-title/);
    assert.match(html, /Book a visit/);
  }
});
