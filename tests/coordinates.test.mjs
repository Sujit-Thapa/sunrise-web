import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

const compiled = ts.transpileModule(readFileSync(new URL('../lib/coordinates.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const loaded = { exports: {} };
vm.runInNewContext(compiled, { exports: loaded.exports });
const { parseCoordinates } = loaded.exports;

test('empty coordinates do not create an ocean pin', () => {
  for (const empty of ['', '   ', null, undefined]) {
    assert.equal(parseCoordinates(empty, empty), null);
    assert.equal(parseCoordinates(empty, 85.324), null);
    assert.equal(parseCoordinates(27.7172, empty), null);
  }
});
test('saved coordinates are returned in longitude, latitude order', () => {
  assert.deepEqual(Array.from(parseCoordinates('27.7172', '85.324')), [85.324, 27.7172]);
  assert.deepEqual(Array.from(parseCoordinates(0, 0)), [0, 0]);
});
test('invalid coordinates are rejected', () => {
  for (const pair of [[91, 85], [27, 181], [-91, 0], [0, -181], ['bad', 85], [Infinity, 0], [true, false]]) {
    assert.equal(parseCoordinates(...pair), null);
  }
});
