const express = require('express');
const bodyParser = require('body-parser');
const createOrder = require('./app/api/create-order');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

app.post('/app/api/create-order', createOrder);

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
