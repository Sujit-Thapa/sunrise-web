import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';

const compiled = ts.transpileModule(readFileSync(new URL('../lib/emi.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const loaded = { exports: {} };
vm.runInNewContext(compiled, { exports: loaded.exports });
const { calculateEmi } = loaded.exports;

test('zero-interest loans divide principal across the full term', () => {
  assert.equal(calculateEmi(120000, 0, 12), 10000);
});
test('fixed-rate loan matches a known amortization example', () => {
  assert.ok(Math.abs(calculateEmi(100000, 12, 12) - 8884.878867834) < 0.000001);
});
test('zero principal gives zero and tiny positive interest remains stable', () => {
  assert.equal(calculateEmi(0, 3.85, 12), 0);
  assert.ok(Math.abs(calculateEmi(120000, 1e-10, 12) - 10000) < 0.000001);
});
test('invalid values never produce a displayed NaN or Infinity', () => {
  for (const args of [[-1, 5, 12], [1000, -1, 12], [1000, 5, 0], [1000, 5, 1.5], [NaN, 5, 12], [1000, Infinity, 12]]) {
    assert.equal(calculateEmi(...args), null);
  }
});
