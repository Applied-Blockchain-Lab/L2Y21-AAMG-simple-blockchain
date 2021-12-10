const transactionsPool = require('../models/transactionsPool');
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