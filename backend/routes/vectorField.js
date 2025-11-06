const express = require('express');
const router = express.Router();

router.post('/evaluate', (req, res) => {
  const point = req.body.point;
  const field = req.body.field;

  // Exemplo: F(x,y,z) = [y, -x, z]
  const result = [
    point[1],
    -point[0],
    point[2],
  ];

  return res.json({ fieldValue: result });
});

module.exports = router;