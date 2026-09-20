import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

const require = createRequire(import.meta.url);

// Capture effect setup/cleanup without a DOM renderer so we can replay the
// development lifecycle and settle requests after the component is gone.
function loadComponent(file, name, mocks = {}, window = {}) {
  const effects = [];
  const refs = [];
  const updates = [];
  const hooks = {
    useEffect: (setup) => effects.push(setup),
    useRef: (value) => { const ref = { current: value }; refs.push(ref); return ref; },
    useState: (value) => [value, (next) => updates.push(next)],
  };
  const loadedModule = { exports: {} };
  const source = ts.transpileModule(`${readFileSync(new URL(file, import.meta.url), 'utf8')}\nexport { ${name} };`, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(source, {
    module: loadedModule, exports: loadedModule.exports, Error, Map, window,
    process: { env: { NEXT_PUBLIC_MAPBOX_TOKEN: 'test-token' } },
    require: (name) => name === 'react' ? hooks : name in mocks ? mocks[name]
      : name.startsWith('@/') ? {} : require(name),
  });
  return { component: loadedModule.exports[name], effects, refs, updates };
}

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
const settle = () => new Promise((resolve) => setImmediate(resolve));

for (const outcome of ['resolve', 'reject']) {
  test(`reservations ignore a late ${outcome} after cleanup without aborting fetch`, async () => {
    const request = deferred();
    let args;
    const harness = loadComponent('../app/account/reservations/page.tsx', 'ReservationResults', {
      '@/lib/backend': { reservationsApi: { findMine: (...values) => { args = values; return request.promise; } } },
    });
    harness.component({ token: 'token', filter: 'ACTIVE', page: 1 });
    const cleanup = harness.effects[0]();
    assert.equal(args.length, 2, 'Do not pass a signal that cleanup can abort');
    cleanup();
    request[outcome](outcome === 'resolve' ? { items: [], total: 0 } : new Error('Late failure'));
    await settle();
    assert.deepEqual(harness.updates, []);
  });
}

test('live reservations still report real request errors', async () => {
  class ApiError extends Error {}
  const harness = loadComponent('../app/account/reservations/page.tsx', 'ReservationResults', {
    '@/lib/api': { ApiError },
    '@/lib/backend': { reservationsApi: { findMine: () => Promise.reject(new Error('Network unavailable')) } },
  });
  harness.component({ token: 'token', filter: 'ALL', page: 1 });
  const cleanup = harness.effects[0]();
  await settle();
  assert.deepEqual(harness.updates, ['Network unavailable']);
  cleanup();
});

function mapHarness(removeError) {
  const frames = new Map();
  const maps = [];
  let frameId = 0;
  class FakeMap {
    handlers = new Map();
    removed = 0;
    constructor() { maps.push(this); }
    addControl() {}
    once(name, fn) { this.handlers.set(name, fn); }
    on(name, fn) { this.handlers.set(name, fn); }
    off(name) { this.handlers.delete(name); }
    remove() { this.removed++; if (removeError) throw removeError; }
  }
  const harness = loadComponent('../components/sections/PropertiesListing.tsx', 'PropertiesMap', {
    'mapbox-gl': { Map: FakeMap, NavigationControl: class {}, AttributionControl: class {} },
  }, {
    requestAnimationFrame: (fn) => { frames.set(++frameId, fn); return frameId; },
    cancelAnimationFrame: (id) => frames.delete(id),
    setTimeout: () => 1, clearTimeout() {}, addEventListener() {}, removeEventListener() {},
  });
  harness.component({ properties: [], hoveredId: null, onHoverChange() {} });
  harness.refs[0].current = {};
  return { ...harness, maps, frames, setup: harness.effects[1], flush: () => {
    const pending = [...frames.values()]; frames.clear(); pending.forEach((fn) => fn());
  } };
}

test('Strict Mode preflight does not create or abort a throwaway map', () => {
  const harness = mapHarness();
  harness.setup()();
  harness.flush();
  assert.equal(harness.maps.length, 0);
  const cleanup = harness.setup();
  harness.flush();
  assert.equal(harness.maps.length, 1);
  cleanup();
  cleanup();
  assert.equal(harness.maps[0].removed, 1);
  assert.equal(harness.maps[0].handlers.size, 0);
});

test('map ignores cancellation events and late errors but surfaces live failures', () => {
  const harness = mapHarness();
  const cleanup = harness.setup(); harness.flush();
  const handleError = harness.maps[0].handlers.get('error');
  handleError({ error: Object.assign(new Error('Cancelled'), { name: 'AbortError' }) });
  assert.deepEqual(harness.updates, []);
  handleError({ error: new Error('Invalid map token') });
  assert.equal(harness.updates.length, 1);
  cleanup();
  handleError({ error: new Error('Late callback') });
  assert.equal(harness.updates.length, 1);
});

test('map cleanup only ignores AbortError, not other teardown bugs', () => {
  const aborted = mapHarness(Object.assign(new Error('Cancelled'), { name: 'AbortError' }));
  const cleanupAbort = aborted.setup(); aborted.flush();
  assert.doesNotThrow(cleanupAbort);
  const broken = mapHarness(new Error('Unexpected teardown failure'));
  const cleanupBroken = broken.setup(); broken.flush();
  assert.throws(cleanupBroken, /Unexpected teardown failure/);
});
