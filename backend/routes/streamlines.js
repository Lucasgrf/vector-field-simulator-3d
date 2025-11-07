const express = require('express');
const router = express.Router();

const {
  getCompiledField,
  integrateStreamline,
} = require('../utils/mathHelpers');

router.post('/', (req, res) => {
  try {
    const { field, seeds, h, maxSteps, bbox, minSpeed, bidirectional, direction } = req.body || {};
    if (!field) return res.status(400).json({ error: 'Forneça "field".' });

    const fieldData = getCompiledField(field);

    const seedsArr = Array.isArray(seeds) && seeds.length ? seeds : [[0, 0, 0]];
    if (seedsArr.length > 200) {
      return res.status(400).json({ error: 'Número de seeds excessivo (máx 200).' });
    }

    const dir = (typeof direction === 'string') ? direction.toLowerCase() : (typeof bidirectional === 'boolean' ? (bidirectional ? 'both' : 'forward') : 'both');
    const baseH = (typeof h === 'number') ? h : 0.1;
    const baseOpts = {
      h: baseH,
      maxSteps: Number.isInteger(maxSteps) ? Math.min(maxSteps, 2000) : 500,
      bbox: bbox || { x: [-10, 10], y: [-10, 10], z: [-10, 10] },
      minSpeed: typeof minSpeed === 'number' ? minSpeed : 1e-12,
      bidirectional: true,
    };

    let results;
    if (dir === 'forward') {
      const optsFwd = { ...baseOpts, h: Math.abs(baseH), bidirectional: false };
      results = seedsArr.map(seed => integrateStreamline(fieldData, seed, optsFwd));
    } else if (dir === 'backward') {
      const optsBwd = { ...baseOpts, h: -Math.abs(baseH), bidirectional: false };
      results = seedsArr.map(seed => integrateStreamline(fieldData, seed, optsBwd));
    } else {
      const optsBoth = { ...baseOpts, h: Math.abs(baseH), bidirectional: true };
      results = seedsArr.map(seed => integrateStreamline(fieldData, seed, optsBoth));
    }
    const lines = results.map(r => r.points);
    const speeds = results.map(r => r.speeds);
    const seedIndices = results.map(r => r.seedIndex);
    return res.json({ lines, speeds, seedIndices, status: 'ok' });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

module.exports = router;
