const transactionsPool = require('../models/transactionsPool');
const blockchain = require('../models/blockchain');

exports.getPendingTransactions = (req, res) => {
    res.json(blockchain.getPendingTransactions());
};

exports.getLatestTransaction = (req, res) => {
    const latestBlock = blockchain.getLastBlock();
    const latestTransactions = latestBlock.getTransactions();

    if (latestTransactions.length > 0 && latestBlock.hasValidTransactions()) {
        res.json(latestTransactions[latestTransactions.length - 1]);
    }
};

exports.getTransactionByHash = (req, res) => {
    res.json(blockchain.getTx(req.params.hash));
};

exports.getTransactionsByAddress = (req, res) => {
    let userTransactions = [];

    blockchain.getAllTxs().forEach(transaction => {
        if (transaction.fromAddress === req.params.address || transaction.toAddress === req.params.address) {
            userTransactions.push(transaction);
        }
    });

    res.json(userTransactions);
};