const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getCompiledField,
  evaluateAtPoint,
  buildGridPoints,
  validateDomain,
  validateResolution,
  evaluateDivergenceAtPoint,
  evaluateCurlAtPoint,
} = require('../utils/mathHelpers');

test('compile and evaluate simple field (x,y,z)', () => {
  const f = getCompiledField('(x, y, z)');
  const v = evaluateAtPoint(f, [1, 2, 3]);
  assert.deepEqual(v, [1, 2, 3]);
});

test('cache returns same compiled entry for same expression', () => {
  const a = getCompiledField('(x, y, z)');
  const b = getCompiledField('(x, y, z)');
  assert.equal(a, b);
});

test('invalid symbol is rejected', () => {
  assert.throws(() => getCompiledField('(foo, y, z)'), /Símbolo não permitido/i);
});

test('buildGridPoints produces expected shape and count', () => {
  const domain = { x: [-1, 1], y: [-1, 1], z: [-1, 1] };
  const resolution = { nx: 3, ny: 3, nz: 3 };
  const { points, shape } = buildGridPoints(domain, resolution);
  assert.deepEqual(shape, [3, 3, 3]);
  assert.equal(points.length, 27);
  assert.deepEqual(points[0], [-1, -1, -1]);
  assert.deepEqual(points.at(-1), [1, 1, 1]);
});

test('validateDomain and validateResolution catch errors', () => {
  assert.throws(() => validateDomain({ x: [0, 1], y: [0, 1] }), /Domínio/);
  assert.throws(() => validateResolution({ nx: 0, ny: 1, nz: 1 }), /Número de pontos/);
});

test('divergence symbolic for (x,y,z) equals 3', () => {
  const fd = getCompiledField('(x, y, z)');
  const val = evaluateDivergenceAtPoint(fd, [5, -2, 7], { method: 'symbolic' });
  assert.equal(val, 3);
});

test('divergence numeric for (x,y,z) approximately 3', () => {
  const fd = getCompiledField('(x, y, z)');
  const val = evaluateDivergenceAtPoint(fd, [5, -2, 7], { method: 'numeric', h: 1e-3 });
  assert.ok(Math.abs(val - 3) < 1e-6, `expected ~3, got ${val}`);
});

test('curl symbolic for (-y,x,0) equals (0,0,2)', () => {
  const fd = getCompiledField('(-y, x, 0)');
  const val = evaluateCurlAtPoint(fd, [1, 2, 3], { method: 'symbolic' });
  assert.deepEqual(val, [0, 0, 2]);
});

test('curl numeric for (-y,x,0) approximately (0,0,2)', () => {
  const fd = getCompiledField('(-y, x, 0)');
  const val = evaluateCurlAtPoint(fd, [1, 2, 3], { method: 'numeric', h: 1e-3 });
  assert.ok(Math.abs(val[0] - 0) < 1e-6);
  assert.ok(Math.abs(val[1] - 0) < 1e-6);
  assert.ok(Math.abs(val[2] - 2) < 1e-5);
});

test('evaluateAtPoint input validation', () => {
  const fd = getCompiledField('(x, y, z)');
  assert.throws(() => evaluateAtPoint(fd, [1, 2]), /Ponto deve ser/);
});

