const HttpServer = require('./src/models/httpServer')
const Blockchain = require('./src/models/blockchain')
const TransactionsPool = require('./src/models/transactionsPool')
require('dotenv').config();

let minerAddress = process.env.MINER_ADDRESS;

var pendingTransactions = new TransactionsPool();
var blockchain = new Blockchain(pendingTransactions, minerAddress);


HttpServer({
	blockchain,
	pendingTransactions
})