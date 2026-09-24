import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
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

test("server-renders the finished Beckett House homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Beckett House Montessori/);
  assert.match(html, /Room to grow/);
  assert.match(html, /Angel/);
  assert.match(html, /Abbey Road/);
  assert.match(html, /Book a visit/);
  assert.match(html, /Life at Beckett House/);
  assert.match(html, /Families stay involved/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /FAQPage/);
  assert.match(html, /src="\/images\/hero-classroom\.webp"/);
  assert.doesNotMatch(html, /\/_vinext\/image/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});

test("removes the disposable starter preview", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /SiteHeader/);
  assert.match(page, /structuredData/);
  assert.match(layout, /Beckett House Montessori/);
  assert.match(layout, /og\.png/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.doesNotMatch(page, /SkeletonPreview|codex-preview/);

  await assert.rejects(access(new URL("app/_sites-preview", templateRoot)));
});

test("publishes answer-ready local nursery data", async () => {
  const response = await render("/locations/angel");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Montessori Nursery in Angel, Islington/);
  assert.match(html, /What parents ask us/);
  assert.match(html, /FAQPage/);
  assert.match(html, /BreadcrumbList/);
  assert.match(html, /GeoCoordinates/);
  assert.match(html, /OpeningHoursSpecification/);
  assert.match(html, /tourBookingPage/);
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
  assert.match(await sitemapResponse.text(), /locations\/abbey-road/);
  assert.match(llms, /Beckett House Montessori/);
  assert.match(llms, /Current availability, fees and funding arrangements/);
});
