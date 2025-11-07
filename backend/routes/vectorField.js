const express = require('express');
const router = express.Router();
const {
  getCompiledField,
  evaluateAtPoint,
  buildGridPoints,
  validateDomain,
  validateResolution,
  evaluateDivergenceAtPoint,
  evaluateCurlAtPoint,
  evaluateScalarOnPoints,
  evaluateVectorOnPoints,
} = require('../utils/mathHelpers');

// Avalia o campo em um único ponto: { field: "(P,Q,R)", point: [x,y,z] }
router.post('/evaluate', (req, res) => {
  try {
    const { field, point } = req.body || {};
    if (!field || !point) return res.status(400).json({ error: 'Body deve conter { field, point }.' });
    const compiled = getCompiledField(field);
    const value = evaluateAtPoint(compiled, point);
    return res.json({ fieldValue: value, status: 'ok' });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// Avalia o campo em vários pontos de uma grade ou em lista de pontos
// Body (opção A): { field, points: [[x,y,z], ...] }
// Body (opção B): { field, domain: {x:[min,max], y:[min,max], z:[min,max]}, resolution: {nx,ny,nz} }
router.post('/evaluate-grid', (req, res) => {
  try {
    const { field, points, domain, resolution } = req.body || {};
    if (!field) return res.status(400).json({ error: 'Body deve conter o campo "field".' });

    let pts = points;
    let shape = null;

    if (!Array.isArray(pts)) {
      // construir grade a partir de domínio + resolução
      if (!domain || !resolution) return res.status(400).json({ error: 'Forneça "points" ou { domain, resolution }.' });
      validateDomain(domain);
      validateResolution(resolution);
      const grid = buildGridPoints(domain, resolution);
      pts = grid.points;
      shape = grid.shape;
    }

    const compiled = getCompiledField(field);
    const values = pts.map((p) => evaluateAtPoint(compiled, p));
    return res.json({ points: pts, values, shape, status: 'ok' });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

module.exports = router;

// ---- Divergence and Curl ----

// Body (ponto): { field, point, method?: 'auto'|'symbolic'|'numeric', h?: number }
// Body (grid/list): { field, points } ou { field, domain, resolution }
router.post('/div', (req, res) => {
  try {
    const { field, point, points, domain, resolution, method = 'auto', h } = req.body || {};
    if (!field) return res.status(400).json({ error: 'Body deve conter o campo "field".' });
    const fieldData = getCompiledField(field);
    const opts = { method, h: typeof h === 'number' && h > 0 ? h : 1e-3 };

    if (Array.isArray(point)) {
      const value = evaluateDivergenceAtPoint(fieldData, point, opts);
      return res.json({ value, status: 'ok' });
    }

    let pts = points;
    let shape = null;
    if (!Array.isArray(pts)) {
      if (!domain || !resolution) return res.status(400).json({ error: 'Forneça "point" ou "points" ou { domain, resolution }.' });
      validateDomain(domain);
      validateResolution(resolution);
      const grid = buildGridPoints(domain, resolution);
      pts = grid.points;
      shape = grid.shape;
    }
    const values = evaluateScalarOnPoints(fieldData, pts, opts, evaluateDivergenceAtPoint);
    return res.json({ points: pts, values, shape, status: 'ok' });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.post('/curl', (req, res) => {
  try {
    const { field, point, points, domain, resolution, method = 'auto', h } = req.body || {};
    if (!field) return res.status(400).json({ error: 'Body deve conter o campo "field".' });
    const fieldData = getCompiledField(field);
    const opts = { method, h: typeof h === 'number' && h > 0 ? h : 1e-3 };

    if (Array.isArray(point)) {
      const value = evaluateCurlAtPoint(fieldData, point, opts);
      return res.json({ value, status: 'ok' });
    }

    let pts = points;
    let shape = null;
    if (!Array.isArray(pts)) {
      if (!domain || !resolution) return res.status(400).json({ error: 'Forneça "point" ou "points" ou { domain, resolution }.' });
      validateDomain(domain);
      validateResolution(resolution);
      const grid = buildGridPoints(domain, resolution);
      pts = grid.points;
      shape = grid.shape;
    }
    const values = evaluateVectorOnPoints(fieldData, pts, opts, evaluateCurlAtPoint);
    return res.json({ points: pts, values, shape, status: 'ok' });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});
