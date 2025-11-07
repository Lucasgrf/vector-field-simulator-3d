const express = require('express');
const router = express.Router();
const {
  getCompiledField,
  evaluateAtPoint,
  buildGridPoints,
  validateDomain,
  validateResolution,
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
