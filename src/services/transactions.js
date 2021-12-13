const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const Transaction = require('../models/transaction');
const blockchain = require('../models/blockchain');

exports.getPendingTransactions = (req, res) => {
    res.json(blockchain.getPendingTransactions());
};

exports.getLatestTransaction = () => {
    const latestBlock = blockchain.getLastBlock();
    const latestTransactions = latestBlock.getTransactions();

    if (latestTransactions.length > 0 && latestBlock.hasValidTransactions()) {
        res.json(latestTransactions[latestTransactions.length - 1]);
    }
};

exports.getTransactionByHash = (hash) => {
    res.json(blockchain.getTx(hash));
};

exports.getTransactionsByAddress = (address) => {
    let userTransactions = [];

    blockchain.getAllTxs().forEach(transaction => {
        if (transaction.fromAddress === address || transaction.toAddress === address) {
            userTransactions.push(transaction);
        }
    });

    res.json(userTransactions);
};

exports.newTransaction = (req, res) => {
    const senderPublicKey = process.env.PUBLIC_KEY;
    const senderPrivateKey = process.env.PRIVATE_KEY;
    const toAddress = req.body.toAddress;
    const amount = req.body.amount;

    const key = ec.keyFromPrivate(senderPrivateKey);

    const tx = new Transaction(senderPublicKey, toAddress, amount);
    tx.signTransaction(key);
    blockchain.addTransaction(tx);
    
}