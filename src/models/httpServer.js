const express = require('express');
const Transaction = require('./transaction');
const TransactionsPool = require('./transactionsPool');
const rp = require('request-promise');

module.exports = ({port, blockchain, node}) => {

    const app = express();
    app.use(express.json());

    app.get('/', (req, res) => {
        res.send('Everything is ok')
    })

    /* Events */

    blockchain.on('BlockMined', ([block, txReward]) => {
       
        const requestPromises = [];

        node.getPeers().forEach(nodeUrl => {
            const requestOptions = {
                uri: nodeUrl + "/blocks/receiveNewBlock",
                method: 'POST',
                body: { newBlock: block },
                json: true
            };

            requestPromises.push(rp(requestOptions));
        })

        Promise.all(requestPromises)
        .then(() => {
            const requestOptions = {
                uri: node.getPoolInfo().address + "/transactions/broadcast",
                method: 'POST',
                body: {...txReward, reward: true},
                json: true
            };

            return rp(requestOptions);
        })
    });

    blockchain.on('NewNode', () => {

        const initialPeer = process.env.INITIAL_PEER_URL;
        
        const newPeer = node.getPoolInfo().address;

        const requestOptions = {
            uri: initialPeer + '/blockchain/nodes/registerAndBroadcast',
            method: 'POST',
            body: {newNodeUrl: newPeer},
            json: true
        };

        rp(requestOptions)
        .then(() => {
            console.log('Connected to inital peer');
            blockchain.emit('ConnectedNewNode', newPeer);
        })

    })

    blockchain.on('ConnectedNewNode', (newPeer) => {
        
        const requestOptions = {
            uri: newPeer + '/blockchain/consensus',
            method: 'GET',
            json: true
        };

        rp(requestOptions)
        .then(() => {
            console.log('Chain will now synchronise');
        })
    })

    /* Block APIs */

    app.post('/blocks/receiveNewBlock', (req, res) => {
        const newBlock = req.body.newBlock;
        const lastBlock = blockchain.getLastBlock();

        if (newBlock === undefined){
            console.log('rejected')
            return res.json({note: "New block rejected."})
        }

        const correctHash = lastBlock.hash === newBlock.previousHash;

        if (correctHash) {    
            blockchain.chain.push(newBlock);
            blockchain.pendingTransactions.draw();
            res.json({note: "New block received and accepted. "})
        } else {
            res.json({note: "New block rejected."})
        }
    })

    app.get('/blocks/hash/:blockHash', (req, res) => {
        const blockHash = req.params.blockHash;
        res.json(blockchain.getBlock(blockHash));
    })

    app.get('/blocks/all', (req, res) => {
        res.json(blockchain.getAllBlocks());
    })

    app.get('/blocks/last', (req, res) => {
        res.json(blockchain.getLastBlock());
    })

    /* Blockchain APIs */

    app.get('/blockchain', (req, res) => {
        res.json(blockchain.getBlockchain());
    })

    app.get('/blockchain/generateKeyPair', (req, res) => {
        res.json(blockchain.generateKeyPair());
    })

    app.post('/blockchain/nodes/registerAndBroadcast', (req, res) => {
        const newNodeUrl = req.body.newNodeUrl;

        if (newNodeUrl === undefined){
            return res.json({ note: 'New node registration failed.' })
        }

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

    app.get('/blockchain/consensus', (req, res) => {
        const requestPromises = [];
        node.getPeers().forEach(nodeUrl => {
            const requestOptions = {
                uri: nodeUrl + '/blockchain',
                method: 'GET',
                json: true
            };

            requestPromises.push(rp(requestOptions))
        });

        Promise.all(requestPromises)
        .then(chains => {
            const currentChainLength = blockchain.chain.length;
            let maxChainLength = currentChainLength;
            let newLongestChain = null;
            let newPendingTransactions = new TransactionsPool({});

            chains.forEach(otherBlockchain => {
                let otherBlockchainPendingLength = otherBlockchain.pendingTransactions.currentTransactionCount;
                let newPendingTransactionsLength = newPendingTransactions.currentTransactionCount;
                
                if (otherBlockchain.chain.length > maxChainLength && otherBlockchainPendingLength > newPendingTransactionsLength) {

                    maxChainLength = otherBlockchain.chain.length;
                    newLongestChain = otherBlockchain.chain;
                    newPendingTransactions.transactions = otherBlockchain.pendingTransactions.transactions;

                } else if (otherBlockchainPendingLength > newPendingTransactionsLength) {

                    newPendingTransactions.transactions = otherBlockchain.pendingTransactions.transactions;
                }

            });

            if (!newLongestChain || (newLongestChain && !blockchain.isChainValid(newLongestChain))) {
                res.json({ note: 'Current chain has not been replaced '})
            } else {
                blockchain.chain = newLongestChain;
                blockchain.pendingTransactions = newPendingTransactions;
                res.json({note: 'This chain has been replaced. '})
            }
        });
    });

    app.post('/blockchain/nodes/registerNode', (req, res) => {
        const newNodeUrl = req.body.newNodeUrl;

        if (newNodeUrl === undefined){
            return res.json({ note: 'New node registration failed.' })
        }

        node.addPeers([newNodeUrl]);
        res.json({ note: 'New node registered sucessfully'});
    })

    app.post('/blockchain/nodes/registerNodesBulk', (req, res) => {
        const allNetworkNodes = req.body.allNetworkNodes;

        if (allNetworkNodes === undefined){
            return res.json({ note: 'Bulk registration failed.' })
        }

        node.addPeers(allNetworkNodes);
        res.json({note: 'Bulk registration successful.'})
    })

    app.get('/blockchain/nodes/peers', (req, res) => {
        res.json(node.getPeers());
    })

    app.get('/blockchain/startMining', (req, res) => {

        if (process.env.PUBLIC_KEY && process.env.PRIVATE_KEY && process.env.MINER_ADDRESS) {
            res.send(blockchain.startMining());
        } else {
            res.send('Please first configure your public, private keys and mining address');
        }

    })

    /* Transaction APIs */

    app.post('/transactions/newTransaction', (req, res) => {

        const txObj = req.body;
        Transaction.prototype.isValid(txObj);
        if (txObj.fromAddress !== null)
        blockchain.addTransaction(txObj);
        else 
        blockchain.pendingTransactions.addTx(txObj);
        res.send('Transaction successfully added to pool');
    })

    app.post('/transactions/broadcast', (req, res) => {

        const fromAddress = req.body.fromAddress;
        const toAddress = req.body.toAddress;
        const amount = req.body.amount;

        if (toAddress === undefined || amount === undefined){
            return res.json({note: "Invalid transaction."});
        }
        const signerKey = process.env.PRIVATE_KEY;
        const newTransaction = new Transaction(fromAddress, toAddress, amount);
        if(!req.body.reward) {
            newTransaction.signTransaction(signerKey);
            blockchain.addTransaction(newTransaction);
        } else {
            blockchain.pendingTransactions.addTx(newTransaction);
        }

        const requestPromises = [];
        node.getPeers().forEach(nodeUrl => {
            const requestOptions = {
                uri: nodeUrl + '/transactions/newTransaction',
                method: 'POST',
                body: newTransaction,
                json: true
            };

           requestPromises.push(rp(requestOptions));

        });
        
        Promise.all(requestPromises)
        .then(data => {
            res.json({ note: 'Transaction created and broadcast successfully. '});
        })
    })

    app.get('/transactions/pending', (req, res) => {
        res.json(blockchain.getPendingTransactions())
    })

    /* Address APIs */

    app.get('/balance/:address', (req, res) => {
        const address = req.params.address;
        res.json(blockchain.getBalanceOfAddress(address));
    })

    /* Listen */
    app.get('/blockchain/generateKeyPair', (req, res) => {
        res.json(blockchain.generateKeyPair());
    })

    app.get('/blocks/hash/:blockHash', (req, res) => {
        const blockHash = req.params.blockHash;

        if (blockHash === null || blockHash.length !== 130){
            return res.json("Invalid block hash.");
        }

        res.json(blockchain.getBlock(blockHash));
    })

    app.get('/blocks/all', (req, res) => {
        res.json(blockchain.getAllBlocks());
    })

    app.get('/blocks/last', (req, res) => {
        res.json(blockchain.getLastBlock());
    })

    app.listen(port, '0.0.0.0', () => {
        console.log(`Example app listening at ${node.getPoolInfo().address}`);
    });

    return {app}
}

