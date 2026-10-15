import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";


async function render(pathname = "/", origin = "http://localhost") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`${origin}${pathname}`, {
      headers: { accept: "text/html" },
      redirect: "manual",
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
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
  assert.match(html, /<link rel="canonical" href="https:\/\/www\.beckett-house\.co\.uk\/"/);
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
    assert.match(html, /srcSet="\/_vinext\/image\?url=%2Fimages%2F/, path);
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

test("the image endpoint only serves local photos", async () => {
  assert.equal((await render("/_vinext/image?url=%2F..%2Fworker%2Findex.ts&w=640")).status, 400);
  assert.equal((await render("/_vinext/image?url=https%3A%2F%2Fexample.com%2Fa.jpg&w=640")).status, 400);
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
