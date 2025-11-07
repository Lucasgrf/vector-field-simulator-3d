const math = require('mathjs');

// Allowed symbols and functions for safety when parsing user input
const ALLOWED_SYMBOLS = new Set(['x', 'y', 'z', 'pi', 'e']);
const ALLOWED_FUNCTIONS = new Set([
  'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
  'sinh', 'cosh', 'tanh', 'abs', 'sign',
  'sqrt', 'exp', 'log', 'ln', 'pow', 'min', 'max',
  'add', 'subtract', 'multiply', 'divide', // mathjs operator names (rarely used directly)
]);
const ALLOWED_OPERATORS = new Set(['+', '-', '*', '/', '^']);

function validateNode(node) {
  const type = node.type;
  switch (type) {
    case 'ConstantNode':
    case 'ParenthesisNode':
      return; // always ok
    case 'SymbolNode': {
      const name = node.name;
      if (ALLOWED_SYMBOLS.has(name) || ALLOWED_FUNCTIONS.has(name)) return;
      throw new Error(`Símbolo não permitido: ${name}`);
    }
    case 'OperatorNode': {
      const op = node.op;
      if (!ALLOWED_OPERATORS.has(op)) {
        throw new Error(`Operador não permitido: ${op}`);
      }
      node.args.forEach(validateNode);
      return;
    }
    case 'FunctionNode': {
      // function name may be in node.name or node.fn.name depending on mathjs version
      const fname = node.name || (node.fn && node.fn.name) || 'unknown';
      if (!ALLOWED_FUNCTIONS.has(fname)) {
        throw new Error(`Função não permitida: ${fname}`);
      }
      node.args.forEach(validateNode);
      return;
    }
    default: {
      // Disallow potentially dangerous/irrelevant nodes
      throw new Error(`Construção de expressão não suportada (${type}).`);
    }
  }
}

// Compile a single mathjs node into an eval function f({x,y,z}) -> number
function compileNode(node) {
  const code = node.compile();
  return (scope) => code.evaluate(scope);
}

// Parse field string into three nodes using a vector-like syntax
function parseVectorExpression(fieldStr) {
  if (typeof fieldStr !== 'string') {
    throw new Error('Campo deve ser uma string no formato "(P,Q,R)" ou "P,Q,R".');
  }
  const trimmed = fieldStr.trim().replace(/^\(|\)$/g, '');
  // Use array syntax to preserve commas within functions correctly
  const ast = math.parse(`[${trimmed}]`);
  if (ast.type !== 'ArrayNode' || ast.items.length !== 3) {
    throw new Error('Campo deve conter exatamente três componentes: P, Q e R.');
  }
  // Validate each item
  ast.items.forEach(validateNode);
  return ast.items;
}

// Simple in-memory cache for compiled fields
const fieldCache = new Map(); // key: normalized field string -> { nodes, comps, cache: {div,curl} }

function getCompiledField(fieldStr) {
  const key = fieldStr.trim();
  const cached = fieldCache.get(key);
  if (cached) return cached;
  const nodes = parseVectorExpression(fieldStr);
  const comps = nodes.map(compileNode);
  const entry = { nodes, comps, cache: {} };
  fieldCache.set(key, entry);
  // lightweight cache cap
  if (fieldCache.size > 32) {
    // drop oldest (Map iteration order)
    const firstKey = fieldCache.keys().next().value;
    fieldCache.delete(firstKey);
  }
  return entry;
}

function evaluateAtPoint(compiledField, point) {
  if (!Array.isArray(point) || point.length !== 3) {
    throw new Error('Ponto deve ser um array de 3 números: [x,y,z].');
  }
  const [x, y, z] = point;
  const scope = { x, y, z, pi: Math.PI, e: Math.E };
  const { comps } = compiledField;
  return [comps[0](scope), comps[1](scope), comps[2](scope)];
}

function linspace(min, max, n) {
  if (n <= 1) return [min];
  const step = (max - min) / (n - 1);
  return Array.from({ length: n }, (_, i) => min + i * step);
}

function buildGridPoints(domain, resolution) {
  const { x: xr, y: yr, z: zr } = domain;
  const { nx, ny, nz } = resolution;
  const xs = linspace(xr[0], xr[1], nx);
  const ys = linspace(yr[0], yr[1], ny);
  const zs = linspace(zr[0], zr[1], nz);
  const points = [];
  for (let k = 0; k < nz; k++) {
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        points.push([xs[i], ys[j], zs[k]]);
      }
    }
  }
  return { points, shape: [nx, ny, nz] };
}

function validateDomain(domain) {
  if (!domain || !domain.x || !domain.y || !domain.z) throw new Error('Domínio deve conter x, y, z.');
  const ok = (r) => Array.isArray(r) && r.length === 2 && isFinite(r[0]) && isFinite(r[1]);
  if (!ok(domain.x) || !ok(domain.y) || !ok(domain.z)) throw new Error('Intervalos inválidos no domínio.');
}

function validateResolution(resolution) {
  const { nx, ny, nz } = resolution || {};
  if (!Number.isInteger(nx) || !Number.isInteger(ny) || !Number.isInteger(nz)) {
    throw new Error('Resolução deve conter inteiros nx, ny, nz.');
  }
  const count = nx * ny * nz;
  const MAX = 30000; // cap para evitar sobrecarga
  if (count <= 0 || count > MAX) throw new Error(`Número de pontos inválido/excessivo: ${count} (max ${MAX}).`);
}

module.exports = {
  getCompiledField,
  evaluateAtPoint,
  buildGridPoints,
  validateDomain,
  validateResolution,
};

// ---- Derivatives: divergence and curl ----

function derivativeNode(node, variable) {
  return math.derivative(node, variable);
}

function compileDiv(nodes) {
  const dPx = derivativeNode(nodes[0], 'x');
  const dQy = derivativeNode(nodes[1], 'y');
  const dRz = derivativeNode(nodes[2], 'z');
  const divNode = new math.OperatorNode('+', 'add', [
    new math.OperatorNode('+', 'add', [dPx, dQy]),
    dRz,
  ]);
  return compileNode(divNode);
}

function compileCurl(nodes) {
  const dRdy = derivativeNode(nodes[2], 'y');
  const dQdz = derivativeNode(nodes[1], 'z');
  const dPdz = derivativeNode(nodes[0], 'z');
  const dRdx = derivativeNode(nodes[2], 'x');
  const dQdx = derivativeNode(nodes[1], 'x');
  const dPdy = derivativeNode(nodes[0], 'y');
  const cxNode = new math.OperatorNode('-', 'subtract', [dRdy, dQdz]);
  const cyNode = new math.OperatorNode('-', 'subtract', [dPdz, dRdx]);
  const czNode = new math.OperatorNode('-', 'subtract', [dQdx, dPdy]);
  return [compileNode(cxNode), compileNode(cyNode), compileNode(czNode)];
}

function numericPartial(comp, point, axis, h) {
  const [x, y, z] = point;
  const scopePlus = { x, y, z, pi: Math.PI, e: Math.E };
  const scopeMinus = { x, y, z, pi: Math.PI, e: Math.E };
  if (axis === 'x') { scopePlus.x = x + h; scopeMinus.x = x - h; }
  if (axis === 'y') { scopePlus.y = y + h; scopeMinus.y = y - h; }
  if (axis === 'z') { scopePlus.z = z + h; scopeMinus.z = z - h; }
  const fp = comp(scopePlus);
  const fm = comp(scopeMinus);
  return (fp - fm) / (2 * h);
}

function evaluateDivergenceAtPoint(fieldData, point, { method = 'auto', h = 1e-3 } = {}) {
  const scope = { x: point[0], y: point[1], z: point[2], pi: Math.PI, e: Math.E };
  if (method === 'symbolic' || method === 'auto') {
    try {
      if (!fieldData.cache.div) {
        fieldData.cache.div = compileDiv(fieldData.nodes);
      }
      return fieldData.cache.div(scope);
    } catch (_) {
      if (method === 'symbolic') throw new Error('Falha no cálculo simbólico do divergente.');
      // fallback para numérico
    }
  }
  const [fP, fQ, fR] = fieldData.comps;
  const dPx = numericPartial(fP, point, 'x', h);
  const dQy = numericPartial(fQ, point, 'y', h);
  const dRz = numericPartial(fR, point, 'z', h);
  return dPx + dQy + dRz;
}

function evaluateCurlAtPoint(fieldData, point, { method = 'auto', h = 1e-3 } = {}) {
  const scope = { x: point[0], y: point[1], z: point[2], pi: Math.PI, e: Math.E };
  if (method === 'symbolic' || method === 'auto') {
    try {
      if (!fieldData.cache.curl) {
        fieldData.cache.curl = compileCurl(fieldData.nodes);
      }
      const [cx, cy, cz] = fieldData.cache.curl;
      return [cx(scope), cy(scope), cz(scope)];
    } catch (_) {
      if (method === 'symbolic') throw new Error('Falha no cálculo simbólico do rotacional.');
      // fallback para numérico
    }
  }
  const [fP, fQ, fR] = fieldData.comps;
  const dRdy = numericPartial(fR, point, 'y', h);
  const dQdz = numericPartial(fQ, point, 'z', h);
  const dPdz = numericPartial(fP, point, 'z', h);
  const dRdx = numericPartial(fR, point, 'x', h);
  const dQdx = numericPartial(fQ, point, 'x', h);
  const dPdy = numericPartial(fP, point, 'y', h);
  return [dRdy - dQdz, dPdz - dRdx, dQdx - dPdy];
}

function evaluateScalarOnPoints(fieldData, points, options, scalarEvaluator) {
  return points.map((p) => scalarEvaluator(fieldData, p, options));
}

function evaluateVectorOnPoints(fieldData, points, options, vectorEvaluator) {
  return points.map((p) => vectorEvaluator(fieldData, p, options));
}

module.exports.evaluateDivergenceAtPoint = evaluateDivergenceAtPoint;
module.exports.evaluateCurlAtPoint = evaluateCurlAtPoint;
module.exports.evaluateScalarOnPoints = evaluateScalarOnPoints;
module.exports.evaluateVectorOnPoints = evaluateVectorOnPoints;

