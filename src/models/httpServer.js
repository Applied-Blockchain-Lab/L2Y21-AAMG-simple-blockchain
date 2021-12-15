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
        .then(data => {
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

    app.post('/blocks/receiveNewBlock', (req, res) => {
        const newBlock = req.body.newBlock;
        const lastBlock = blockchain.getLastBlock();
        const correctHash = lastBlock.hash === newBlock.previousHash;
        if (correctHash) {    
            blockchain.chain.push(newBlock);
            blockchain.pendingTransactions.draw();
            res.json({note: "New block received and accepted. "})
        } else {
            res.json({note: "New block rejected. "})
        }
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
            let newPendingTransactions = null;

            chains.forEach(otherBlockchain => {
                
                if (otherBlockchain.chain.length > maxChainLength) {
                    maxChainLength = otherBlockchain.chain.length;
                    newLongestChain = otherBlockchain.chain;
                    newPendingTransactions = otherBlockchain.pendingTransactions;
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

    app.get('/blockchain', (req, res) => {
        res.json(blockchain.getBlockchain());
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
        const signerKey = process.env.PRIVATE_KEY;
        console.log(req.body.reward);
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

    app.get('/blocks/last', (req, res) => {
        res.json(blockchain.getLastBlock());
    })

    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`);
    });

    return {app}
}

