import assert from "node:assert/strict";
import test from "node:test";
import { register } from "node:module";
import { DatabaseSync } from "node:sqlite";
import { readFile } from "node:fs/promises";

// Execute source modules without bundling server-only imports into client code.
register(`data:text/javascript,${encodeURIComponent(`
  import { readFile } from 'node:fs/promises';
  import ts from ${JSON.stringify(new URL('../node_modules/typescript/lib/typescript.js', import.meta.url).href)};
  export async function resolve(specifier, context, next) {
    if (specifier === 'server-only' || specifier === 'cloudflare:workers') return { url: 'data:text/javascript,export const env = {};', shortCircuit: true };
    if (specifier.startsWith('.') && !/\\.[a-z]+$/.test(specifier)) return next(specifier + '.ts', context);
    return next(specifier, context);
  }
  export async function load(url, context, next) {
    if (url.endsWith('.ts')) return { format: 'module', shortCircuit: true, source: ts.transpileModule(await readFile(new URL(url), 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText };
    return next(url, context);
  }
`)}`, import.meta.url);
const { defaultHomepageContent, validateHomepageContent } = await import('../lib/homepage-content.ts');
const { getHomepageRecord, getPublishedHomepageContent, HOMEPAGE_SETTING_KEY } = await import('../lib/homepage-store.ts');
const { handleAdmin } = await import('../worker/admin.ts');
const schema = await readFile(new URL('../migrations/0001_admin.sql', import.meta.url), 'utf8');
function database() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(schema);
  const db = {
    prepare(sql) {
      return { bind(...values) { return {
        first: async () => sqlite.prepare(sql).get(...values) ?? null,
        execute: () => ({ success: true, meta: { changes: Number(sqlite.prepare(sql).run(...values).changes) } }),
      }; } };
    },
    async batch(statements) {
      sqlite.exec('BEGIN');
      try { const results = statements.map(s => s.execute()); sqlite.exec('COMMIT'); return results; }
      catch (error) { sqlite.exec('ROLLBACK'); throw error; }
    },
  };
  return { db, sqlite };
}
function api(db, path = '/pages/home', method = 'GET', data) {
  return handleAdmin(new Request(`http://localhost/api/admin${path}`, { method, headers: { Origin: 'http://localhost', 'Content-Type': 'application/json' }, ...(data === undefined ? {} : { body: JSON.stringify(data) }) }), { DB: db }, 'editor@example.invalid');
}
const changed = () => ({ ...structuredClone(defaultHomepageContent), heading: 'A published heading', introduction: 'Families & children learn together.' });

test('validates all structured content, lengths, plain text and local image paths', () => {
  assert.deepEqual(validateHomepageContent(defaultHomepageContent), defaultHomepageContent);
  for (const value of [null, [], {}, { ...changed(), heading: '' }, { ...changed(), introduction: 'a'.repeat(4001) }, { ...changed(), heading: '<script>alert(1)</script>' }, { ...changed(), nurseryLabels: { angel: 'Angel' } }]) assert.throws(() => validateHomepageContent(value));
  for (const imageSrc of ['https://example.com/a.jpg', '//example.com/a.jpg', '/images/../a.jpg', '/images/%2e%2e/a.jpg', '/images/a.jpg?x=1', '/images/a.jpg#x', '/images/a.svg', '/images//a.jpg', '/images/a\\b.jpg']) {
    const value = changed(); value.nurseryCards.angel.imageSrc = imageSrc;
    assert.throws(() => validateHomepageContent(value), imageSrc);
  }
  assert.equal(validateHomepageContent(changed()).introduction, 'Families & children learn together.');
});

test('absent record reads without mutation; draft is private; publish uses saved draft; stale operations conflict', async () => {
  const { db, sqlite } = database();
  assert.equal((await getHomepageRecord(db)).version, 0);
  assert.equal(sqlite.prepare('SELECT count(*) AS n FROM settings').get().n, 0);
  const list = await (await api(db, '/pages')).json();
  assert.equal(list.length, 3); assert.equal(list[0].slug, 'home');
  assert.equal((await api(db, '/pages/home/publish', 'POST', { version: 0 })).status, 400);
  const savedResponse = await api(db, '/pages/home', 'PUT', { version: 0, content: changed() });
  assert.equal(savedResponse.status, 200);
  const saved = await savedResponse.json();
  assert.equal(saved.version, 1); assert.equal(saved.draft.heading, changed().heading);
  assert.ok(saved.draftUpdatedAt); assert.equal(saved.publishedAt, null);
  assert.deepEqual(await getPublishedHomepageContent(db), defaultHomepageContent);
  assert.equal((await api(db, '/pages/home', 'PUT', { version: 0, content: changed() })).status, 409);
  assert.equal((await api(db, '/pages/home/publish', 'POST', { version: 0 })).status, 409);
  const published = await (await api(db, '/pages/home/publish', 'POST', { version: 1, content: defaultHomepageContent })).json();
  assert.equal(published.version, 2); assert.ok(published.publishedAt);
  assert.deepEqual(await getPublishedHomepageContent(db), changed());
  const newer = { ...changed(), heading: 'Still private' };
  await api(db, '/pages/home', 'PUT', { version: 2, content: newer });
  assert.deepEqual(await getPublishedHomepageContent(db), changed());
  assert.deepEqual(sqlite.prepare('SELECT action FROM activity ORDER BY id').all().map(r => r.action), ['draft', 'publish', 'draft']);
  sqlite.close();
});

test('simultaneous first and subsequent saves produce one winner and one audit entry', async () => {
  const { db, sqlite } = database();
  for (const version of [0, 1]) {
    const responses = await Promise.all([api(db, '/pages/home', 'PUT', { version, content: changed() }), api(db, '/pages/home', 'PUT', { version, content: { ...changed(), heading: 'Other editor' } })]);
    assert.deepEqual(responses.map(r => r.status).sort(), [200, 409]);
  }
  assert.equal((await getHomepageRecord(db)).version, 2);
  assert.equal(sqlite.prepare('SELECT count(*) AS n FROM activity').get().n, 2);
  sqlite.close();
});

test('invalid mutations leave no writes; corruption and storage failures fail visibly for admin and safely for public', async () => {
  const { db, sqlite } = database();
  for (const data of [null, {}, { version: -1, content: changed() }, { version: '0', content: changed() }, { version: 0, content: {} }]) assert.equal((await api(db, '/pages/home', 'PUT', data)).status, 400);
  assert.equal(sqlite.prepare('SELECT count(*) AS n FROM settings').get().n, 0);
  sqlite.prepare('INSERT INTO settings VALUES (?, ?, ?, ?)').run(HOMEPAGE_SETTING_KEY, JSON.stringify({ published: { heading: '<script>' } }), 'now', 'test');
  assert.equal((await api(db)).status, 503);
  assert.deepEqual(await getPublishedHomepageContent(db), defaultHomepageContent);
  const broken = { prepare() { throw new Error('Storage unavailable'); } };
  assert.equal((await api(broken)).status, 503);
  assert.equal((await api(broken, '/pages/home', 'PUT', { version: 0, content: changed() })).status, 503);
  assert.deepEqual(await getPublishedHomepageContent(broken), defaultHomepageContent);
  sqlite.close();
});
