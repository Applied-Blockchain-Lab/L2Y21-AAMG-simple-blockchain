const express = require('express');
const Transaction = require('./transaction');

const transactionsRoutes = require('../routes/transactions.js');
const blocksRoutes = require('../routes/blocks.js');
const blockchainRoutes = require('../routes/blockchain');

module.exports = ({blockchain, pendingTransactions}) => {
    const app = express();
    app.use(express.json());

    app.get('/', (req, res) => {
        res.send('Everything is ok')
    })

    app.get('/blockchain/startMining', (req, res) => {

        if (process.env.PUBLIC_KEY && process.env.PRIVATE_KEY && process.env.MINER_ADDRESS) {
            blockchain.startMining();
            res.send('Miner started !');
        } else {
            res.send('Please first configure your public, private keys and mining address');
        }

    })

    app.post('/transactions/newTransaction', (req, res) => {

        const fromAddress = req.body.fromAddress;
        const toAddress = req.body.toAddress;
        const amount = req.body.amount;
        const signerKey = process.env.PRIVATE_KEY;

        const txObj = new Transaction(fromAddress, toAddress, amount);
        txObj.signTransaction(signerKey);
        blockchain.addTransaction(txObj);
        res.send('Transaction successfully added to pool');
    })

    app.get('/transactions/pending', (req, res) => {
        res.json(blockchain.getPendingTransactions())
    })

    app.get('/balance/:address', (req, res) => {
        const address = req.params.address;
        res.json(blockchain.getBalanceOfAddress(address));
    })

    app.get('/blockchain/generateKeyPair', (req, res) => {
        res.json(blockchain.generateKeyPair());
    })

    app.get('/blocks/hash/:blockHash', (req, res) => {
        const blockHash = req.params.blockHash;
        res.json(blockchain.getBlock(blockHash));
    })

    app.get('/blocks/all', (req, res) => {
        res.json(blockchain.getAllBlocks());
    })

    app.listen(8080, () => {
        console.log(`Example app listening at http://localhost:${8080}`);
    });

    return {app}
}

