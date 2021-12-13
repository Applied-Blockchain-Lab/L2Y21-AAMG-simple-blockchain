const express = require('express');
const app = express();
const port = 1312; // temporary hardcoded port

const transactionsRoutes = require('./src/routes/transactions.js');
const blocksRoutes = require('./src/routes/blocks.js');

app.use("/transactions", transactionsRoutes);
app.use("/blocks", blocksRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});