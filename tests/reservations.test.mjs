import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, '..');

// Exercise the real TypeScript API and route guard with isolated HTTP responses.
function app(fetch) {
  const cache = new Map();
  function load(filename) {
    const absolute = path.join(root, filename);
    if (cache.has(absolute)) return cache.get(absolute);
    const loadedModule = { exports: {} };
    cache.set(absolute, loadedModule.exports);
    const source = ts.transpileModule(readFileSync(absolute, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    const importModule = (name) => {
      if (name === 'next/server') return { NextResponse: {
        next: () => ({ kind: 'next' }),
        redirect: (url) => ({ kind: 'redirect', url: String(url), cookies: { delete() {} } }),
      } };
      if (name.startsWith('@/')) return load(`${name.slice(2)}.ts`);
      if (name.startsWith('.')) return load(path.relative(root, path.resolve(path.dirname(absolute), `${name}.ts`)));
      return require(name);
    };
    vm.runInNewContext(source, {
      module: loadedModule, exports: loadedModule.exports, require: importModule, fetch, URL, URLSearchParams,
      process: { env: { NEXT_PUBLIC_API_URL: 'https://backend.test' } },
    }, { filename: absolute });
    return loadedModule.exports;
  }
  return load;
}
const response = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json' },
});
const success = (data) => response({ success: true, data, meta: {} });
const failure = (status, code, message) => response({ success: false, error: { code, message, details: [] }, meta: {} }, status);

for (const status of [undefined, 'ACTIVE', 'CLAIMED', 'COMPLETED', 'CANCELLED']) {
  test(`mine unwraps data and sends pagination and ${status ?? 'all'} status with the USER token`, async () => {
    let request;
    const data = { items: [{ id: 'r1', property: { title: 'Reserved home', status: 'RESERVED' } }], total: 45, page: 2, limit: 20 };
    const load = app(async (url, options) => { request = { url: new URL(url), options }; return success(data); });
    const { reservationsApi } = load('lib/backend.ts');
    const controller = new AbortController();
    const result = await reservationsApi.findMine('user-token', { status, page: 2, limit: 20 }, controller.signal);
    assert.deepEqual(result, data);
    assert.equal(request.url.pathname, '/v1/reservations/mine');
    assert.equal(request.url.searchParams.get('status'), status ?? null);
    assert.equal(request.url.searchParams.get('page'), '2');
    assert.equal(request.url.searchParams.get('limit'), '20');
    assert.equal(request.options.headers.Authorization, 'Bearer user-token');
    assert.equal(request.options.cache, 'no-store');
    assert.equal(request.options.signal, controller.signal);
  });
}

test('404 retains its status and backend error message for the unavailable screen', async () => {
  const load = app(async () => failure(404, 'PROPERTY_NOT_FOUND', 'Property is unavailable.'));
  const { ApiError } = load('lib/api.ts');
  await assert.rejects(load('lib/backend.ts').propertiesApi.findOne('reserved-id'), (error) => {
    assert.ok(error instanceof ApiError);
    assert.equal(error.status, 404);
    assert.equal(error.code, 'PROPERTY_NOT_FOUND');
    assert.equal(error.message, 'Property is unavailable.');
    return true;
  });
});

test('error envelopes without data reject, even with an HTTP success status', async () => {
  const load = app(async () => failure(200, 'RESERVATION_UNAVAILABLE', 'Reservation could not be loaded.'));
  await assert.rejects(load('lib/backend.ts').reservationsApi.findMine('user-token'), /Reservation could not be loaded/);
});

for (const status of [401, 403, 500]) {
  test(`mine rejects HTTP ${status} instead of treating it as an empty list`, async () => {
    const load = app(async () => failure(status, 'REQUEST_FAILED', 'Request failed.'));
    await assert.rejects(load('lib/backend.ts').reservationsApi.findMine('token'), (error) => error.status === status);
  });
}

test('empty lists retain server pagination', async () => {
  const data = { items: [], page: 1, limit: 20, total: 0 };
  const load = app(async () => success(data));
  assert.deepEqual(await load('lib/backend.ts').reservationsApi.findMine('token'), data);
});

function request(pathname, token) {
  const url = new URL(pathname, 'https://sunrise.test');
  url.clone = () => new URL(url);
  return { url: String(url), nextUrl: url, cookies: { get: () => token ? { value: token } : undefined } };
}
for (const [role, destination] of [['USER', null], ['AGENT', '/agent'], ['ADMIN', '/admin']]) {
  test(`reservations route allows USER only: ${role}`, async () => {
    const load = app(async () => success({ role }));
    const result = await load('proxy.ts').proxy(request('/account/reservations', 'token'));
    assert.equal(result.kind, destination ? 'redirect' : 'next');
    if (destination) assert.equal(new URL(result.url).pathname, destination);
  });
}

test('unauthenticated reservations requests redirect to login with a return path', async () => {
  const load = app(async () => { throw new Error('Must not fetch without a token'); });
  const result = await load('proxy.ts').proxy(request('/account/reservations'));
  const url = new URL(result.url);
  assert.equal(url.pathname, '/auth/login');
  assert.equal(url.searchParams.get('next'), '/account/reservations');
});

for (const [role, route] of [['AGENT', '/agent'], ['ADMIN', '/admin']]) {
  test(`${role} can still access their property tools and request RESERVED listings`, async () => {
    const requests = [];
    const load = app(async (url, options) => {
      requests.push({ url: new URL(url), options });
      return url.endsWith('/auth/me') ? success({ role }) : success({ items: [], total: 0 });
    });
    assert.equal((await load('proxy.ts').proxy(request(route, 'staff-token'))).kind, 'next');
    await load('lib/backend.ts').propertiesApi.findAll({ status: 'RESERVED' }, 'staff-token');
    assert.equal(requests[1].url.searchParams.get('status'), 'RESERVED');
    assert.equal(requests[1].options.headers.Authorization, 'Bearer staff-token');
  });
}
