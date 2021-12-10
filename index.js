const express = require('express');
const app = express();
const port = 1312; // temporary hardcoded port

const transactionsRoutes = require('./routes/transactions.js');

app.use("/transactions", transactionsRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});