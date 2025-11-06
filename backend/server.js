const express = require('express');
const cors = require('cors');

const vectorFieldRoutes = require('./routes/vectorField');
const integrationRoutes = require('./routes/integration');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/vector-field', vectorFieldRoutes);
app.use('/api/integration', integrationRoutes);

app.listen(3000, () => {
  console.log('Backend rodando na porta 3000...');
});