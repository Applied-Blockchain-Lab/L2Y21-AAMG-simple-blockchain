const express = require('express');
const Transaction = require('./transaction');
const rp = require('request-promise');

const transactionsRoutes = require('../routes/transactions.js');
const blocksRoutes = require('../routes/blocks.js');
const blockchainRoutes = require('../routes/blockchain');

module.exports = ({port, blockchain, node, pendingTransactions}) => {
    const app = express();
    app.use(express.json());

    app.get('/', (req, res) => {
        res.send('Everything is ok')
    })

    app.post('/blockchain/nodes/registerAndBroadcast', (req, res) => {
        const newNodeUrl = req.body.newNodeUrl;
        node.addPeers([newNodeUrl]);

        const regNodesPromises = [];

        node.getPeers().forEach(networkNodeUrl => {
            
            const requestOptions = {
                uri: networkNodeUrl + '/blockchain/nodes/registerNode',
                method: 'POST',
                body: { newNodeUrl },
                json: true
            }

            regNodesPromises.push(rp(requestOptions));
        });

        Promise.all(regNodesPromises)
        .then(data => {
            const bulkRegisterOptions = {
                uri: newNodeUrl + '/blockchain/nodes/registerNodesBulk',
                method: 'POST',
                body: { allNetworkNodes: [...node.getPeers(), node.getPoolInfo().address ] },
                json: true
            };

            return rp(bulkRegisterOptions);
        })
        .then(data => {
            res.json({ note: 'New node registered with network successfully' })
        });

    })

    app.post('/blockchain/nodes/registerNode', (req, res) => {
        const newNodeUrl = req.body.newNodeUrl;
        node.addPeers([newNodeUrl]);
        res.json({ note: 'New node registered sucessfully'});
    })

    app.post('/blockchain/nodes/registerNodesBulk', (req, res) => {
        const allNetworkNodes = req.body.allNetworkNodes;
        node.addPeers(allNetworkNodes);
        res.json({note: 'Bulk registration successful.'})
    })

    app.get('/blockchain/nodes/peers', (req, res) => {
        res.json(node.getPeers());
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

    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`);
    });

    return {app}
}

