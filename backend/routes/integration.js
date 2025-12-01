const express = require('express');
const math = require('mathjs');
const mathHelpers = require('../utils/mathHelpers');
const router = express.Router();

router.post('/line', (req, res) => {
  try {
    const { field, curve, tRange, steps } = req.body;
    // curve: { x, y, z }, tRange: [min, max], steps: int
    if (!field || !curve || !Array.isArray(tRange)) {
      return res.status(400).json({ error: 'Parâmetros inválidos.' });
    }

    const result = mathHelpers.calculateLineIntegral(field, curve, tRange, steps || 100);
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;