const Blockchain = require('./models/blockchain');
const TransactionsPool = require('./models/transactionsPool');
const Transaction = require('./models/transaction');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

var pendingTransactions = new TransactionsPool();

var blockchain = new Blockchain(pendingTransactions, "Miner");

console.log(blockchain.getAllBlocks());

const key = ec.genKeyPair();
const publicKey = key.getPublic('hex');
const privateKey = key.getPrivate('hex');

const myKey = ec.keyFromPrivate(privateKey);

const myWallet = myKey.getPublic('hex');
var tx = new Transaction(myWallet, "User", 10);

tx.signTransaction(myKey);

console.log('balance of user before mining = ', blockchain.getBalanceOfAddress("User"))

blockchain.addTransaction(tx);

blockchain.minePendingTransactions("Miner");

console.log(blockchain.getAllBlocks());

console.log('balance of User after mining = ', blockchain.getBalanceOfAddress("User"))

console.log('balance of Miner after mining = ', blockchain.getBalanceOfAddress("Miner"))

console.log('public key', publicKey)

console.log('private key', privateKey)
