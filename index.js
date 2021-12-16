const HttpServer = require('./src/models/httpServer')
const Blockchain = require('./src/models/blockchain')
const TransactionsPool = require('./src/models/transactionsPool')
const Node = require('./src/models/node');
require('dotenv').config();


const currentNodeUrl = process.env.MY_NODE_URL;

const httpPort = process.env.MY_NODE_PORT || 3001;

let minerAddress = process.env.MINER_ADDRESS;

var pendingTransactions = new TransactionsPool({});
var node = new Node(`http://${currentNodeUrl}:${httpPort}`, "Just node");

var blockchain = new Blockchain(pendingTransactions, minerAddress);


HttpServer({
  port: httpPort,
	blockchain,
  node
})

blockchain.emit('NewNode');