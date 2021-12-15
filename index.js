const HttpServer = require('./src/models/httpServer')
const Blockchain = require('./src/models/blockchain')
const TransactionsPool = require('./src/models/transactionsPool')
const Node = require('./src/models/node');
require('dotenv').config();

const currentNodeUrl = process.argv[3];

const httpPort = process.argv[2];

let minerAddress = process.env.MINER_ADDRESS;

var pendingTransactions = new TransactionsPool();
var node = new Node(currentNodeUrl, "Just node");

var blockchain = new Blockchain(pendingTransactions, minerAddress);


HttpServer({
  port: httpPort,
	blockchain,
  node,
	pendingTransactions
})

blockchain.emit('NewNode');