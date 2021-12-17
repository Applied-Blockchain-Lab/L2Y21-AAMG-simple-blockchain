const HttpServer = require('../src/models/httpServer')
const Blockchain = require('../src/models/blockchain')
const TransactionsPool = require('../src/models/transactionsPool')
const Node = require('../src/models/node');
const block = require('../src/models/block');
const transaction = require('../src/models/transaction');

const SERVER_URL = "http://localhost" + ":" + "3001/"; // main test node
const axios = require('axios');
const Block = require('../src/models/block');
const Transaction = require('../src/models/transaction');

require('dotenv').config();

const createTestNode = (url, port, minerAddress) => {
    var pendingTransactions = new TransactionsPool({});
    var node = new Node(`http://${url}:${port}`, "Just node");

    var blockchain = new Blockchain(pendingTransactions, minerAddress);

    HttpServer({
        port: port,
        blockchain,
        node,
        pendingTransactions
    })

    blockchain.emit('NewNode');
    return {
        node: node,
        blockchain: blockchain
    }
}

let node = null;

beforeAll(() =>
    node = createTestNode("localhost", "3001",
        '0467672ef21bea1b98528f5262102d9cdb8ebeb04af762145d85868c626c21abe9912fd8e554e6dc742ada69e0f239917a3ab34ef1f752d2ef7a917c7bec029491'));


describe('GET /', () => {
    it('should return OK status and Hello World message', async () => {
        const res = await axios.get(SERVER_URL);

        expect(res.status).toEqual(200);
        expect(res.data).toEqual("Everything is ok");
    });
});

describe('POST /blocks/receiveNewBlock', () => {
    it('should reject new block if null', async () => {
        await axios.post(SERVER_URL + "blocks/receiveNewBlock").then((res) => {
            expect(res.data.note).toEqual("New block rejected.");
        });
    });
});

describe('POST /blocks/receiveNewBlock', () => {
    it('should reject new block if hash is not related to previous block', async () => {
        await axios.post(SERVER_URL + "blocks/receiveNewBlock", {
            newBlock: 'randomHashTest'
        }).then((res) => {
            expect(res.data.note).toEqual("New block rejected.");
        });
    });
});

describe('POST /blocks/receiveNewBlock', () => {
    it('should accept new block if hash is related to the previous block', async () => {
        const oldChainSize = node.blockchain.chain.length;

        await axios.post(SERVER_URL + "blocks/receiveNewBlock", {
            newBlock: {
                previousHash: node.blockchain.getLastBlock().hash,
                timestamp: '08/09/2021',
                transactions: [],
                nonce: 5,
                hash: block.prototype.calculateHash()
            }
        }).then((res) => {
            expect(res.data.note).toEqual("New block received and accepted.");
            expect(node.blockchain.chain.length).toBeGreaterThan(oldChainSize);
        });
    });
});

describe('POST /blockchain/nodes/registerAndBroadcast', () => {
    it('should fail node registration if node address is null', async () => {
        await axios.post(SERVER_URL + "blockchain/nodes/registerAndBroadcast").then((res) => {
            expect(res.data.note).toEqual("New node registration failed.");
        });
    });
});

describe('POST /blockchain/nodes/registerAndBroadcast', () => {
    it('should register node and add the peer to other nodes\' lists', async () => {
        const oldPeersCount = node.node.getPeers().length;

        createTestNode("localhost",
            "3002",
            '0467672ef21bea1b98518f5262102d9cdb8ebeb04af762145d85868c626c21abe9912fd8e554e6dc742ada69e0f239917a3ab34ef1f752d2ef7a917c7bec029491');

        await axios.post(SERVER_URL + "blockchain/nodes/registerAndBroadcast", {
            newNodeUrl: "http://localhost:3002"
        }).then((res) => {
            expect(res.data.note).toEqual("New node registered with network successfully");
            expect(node.node.getPeers().length).toBeGreaterThan(oldPeersCount);
        });
    });
});

describe('GET /blockchain', () => {
    it('should return blockchain object for current node', async () => {
        await axios.get(SERVER_URL + "blockchain").then((res) => {
            expect(res.status).toEqual(200);
            expect(res.data).not.toBe(null);
        });
    });
});

describe('POST /blockchain/nodes/registerNode', () => {
    it('should fail node registration if node address is null', async () => {
        await axios.post(SERVER_URL + "blockchain/nodes/registerNode").then((res) => {
            expect(res.data.note).toEqual("New node registration failed.");
        });
    });
});

describe('POST /blockchain/nodes/registerNode', () => {
    it('should register node', async () => {
        const oldPeersCount = node.node.getPeers().length;

        createTestNode("localhost",
            "3003",
            '0467672ef21bea1b98518f5262102d9cdb8ebeb04af762145d85868c626c21abe9912fd8e554e6dc742ada69e0f239917a3ab34ef1f752d2ef7a917c7bec029491');

        await axios.post(SERVER_URL + "blockchain/nodes/registerNode", {
            newNodeUrl: "http://localhost:3003"
        }).then((res) => {
            expect(res.data.note).toEqual("New node registered sucessfully");
            expect(node.node.getPeers().length).toBeGreaterThan(oldPeersCount);
        });
    });
});

describe('POST /blockchain/nodes/registerNodesBulk', () => {
    it('should fail nodes registration if provided array of nodes is null', async () => {
        await axios.post(SERVER_URL + "blockchain/nodes/registerNodesBulk").then((res) => {
            expect(res.data.note).toEqual("Bulk registration failed.");
        });
    });
});

describe('POST /blockchain/nodes/registerNodesBulk', () => {
    it('should fail node registration if node address is null', async () => {
        const oldPeersCount = node.node.getPeers().length;

        await axios.post(SERVER_URL + "blockchain/nodes/registerNodesBulk", {
            allNetworkNodes: ['http://localhost:3002', 'http://localhost:3003', 'http://localhost:3008']
        }).then((res) => {
            expect(res.data.note).toEqual("Bulk registration successful.");
            expect(node.node.getPeers().length).toBeGreaterThan(oldPeersCount);
        });
    });
});


describe('GET blockchain/nodes/peers', () => {
    it('should return an array of peers', async () => {
        await axios.get(SERVER_URL + "blockchain/nodes/peers").then((res) => {
            expect(res.status).toEqual(200);
            expect(res.data).not.toBe(null);
        });
    });
});

describe('GET blockchain/startMining', () => {
    it('should return error message if not configured', async () => {
        await axios.get(SERVER_URL + "blockchain/startMining").then((res) => {
            if (process.env.PUBLIC_KEY === null || process.env.PRIVATE_KEY === null
                || process.env.MINER_ADDRESS === null) {
                expect(res.data).toEqual('Please first configure your public, private keys and mining address');
            }
        });
    });
});

describe('POST /transactions/broadcast', () => {
    it('should return error message if transaction is invalid', async () => {
        await axios.post(SERVER_URL + "transactions/broadcast").then((res) => {
            expect(res.data.note).toEqual("Invalid transaction.");
        });
    });
});

describe('POST /transactions/newTransaction', () => {
    it('should fail because of no signature', async () => {

        await axios.post(SERVER_URL + "transactions/newTransaction", {
            txObj: {
                fromAddress: null,
                toAddress: '0467672ef21bea1b98528f5262102d9cdb8ebeb04af762145d85868c626c21abe9912fd8e554e6dc742ada69e0f239917a3ab34ef1f752d2ef7a917c7bec029491',
                amount: 133,
                fee: 3,
                hash: '0n67672ef21bea1b98528f5262102d9cdb8ebeb04af762145d85868c626c21abe9912fd8e554e6dc742ada69e0f239917a3ab34ef1f752d2ef7a917c7bec029491',
            }
        }).then((res) => {
            expect(res.data.note).toEqual(undefined);
        });
    });
});

describe('GET /transactions/pending', () => {
    it('should return pending transactions', async () => {
        await axios.get(SERVER_URL + "blockchain").then((res) => {
            expect(res.status).toEqual(200);
            expect(res.data).not.toBe(null);
        });
    });
});

describe('GET /balance/address', () => {
    it('should return account balance which is a non-negative number', async () => {
        await axios.get(SERVER_URL + "balance/fakeAddress").then((res) => {
            expect(res.status).toEqual(200);
            expect(res.data).not.toBe(null);
            expect(res.data).toBeGreaterThan(-1);
        });
    });
});

describe('GET /blockchain/generateKeyPair', () => {
    it('should generate unique set of a public and private key', async () => {
        await axios.get(SERVER_URL + "blockchain/generateKeyPair").then((res) => {
            expect(res.status).toEqual(200);
            expect(res.data.privateKey).not.toBe(null);
            expect(res.data.publicKey).not.toBe(null);

            const privateValue = res.data.privateKey;
            const publicValue = res.data.publickKey;

            expect(privateValue).toHaveLength(64);
            expect(publicValue).toHaveLength(130);
        });
    });
});

describe('GET /blocks/hash/:blockHash', () => {
    it('should return error message if hash is not valid', async () => {
        await axios.get(SERVER_URL + "blocks/hash/invalidHash").then((res) => {
            expect(res.status).toEqual(200);
            expect(res.data).toBe("");
        });
    });
});

describe('GET /blocks/hash/:blockHash', () => {
    it('should return null object if not found or the block itself', async () => {
        await axios.get(SERVER_URL + "blocks/hash/0467672ef21bea1b98528f5262102d9cdb8ebeb04af762145d85868c626c21abe9912fd8e554e6dc742ada69e0f239917a3ab34ef1f752d2ef7a917c7bec029491").then((res) => {
            expect(res.status).toEqual(200);
            expect(res.data).not.toBe(null);
        });
    });
});

describe('GET /blocks/all', () => {
    it('should return all blocks', async () => {
        await axios.get(SERVER_URL + "blocks/all").then((res) => {
            expect(res.status).toEqual(200);
            expect(res.data).not.toBe(null);
        });
    });
});

describe('GET /blocks/last', () => {
    it('should return latest blocks', async () => {
        await axios.get(SERVER_URL + "blocks/last").then((res) => {
            expect(res.status).toEqual(200);
            expect(res.data).not.toBe(null);
        });
    });
});

describe('Calculate hash function', () => {
    it('should generate different hashes for different inputs', async () => {
        testBlock = new Block({}, '07/11/2021', '');
        testBlockTwo = new Block({}, '01/12/2021', '');

        expect(Block.prototype.calculateHash(testBlock)).not.toEqual(Block.prototype.calculateHash(testBlockTwo));
    });
});

describe('Calculate fee function', () => {
    it('should generate proper fee', async () => {
        transactionOne = new Transaction('', 'addressTwo', 166);

        expect(transactionOne.fee).not.toEqual(transactionOne.calculateFee());
    });
});

describe('Test getter function', () => {
    it('should return proper value', async () => {
        testBlock = new Block({}, '07/11/2021', '');

        expect(testBlock.transactions).toEqual(testBlock.getTransactions());
    });
});

describe('Test getter function', () => {
    it('should return proper value for pending transactions', async () => {
        const currentNodeUrl = process.env.MY_NODE_URL;

        const httpPort = process.env.MY_NODE_PORT;

        let minerAddress = process.env.MINER_ADDRESS;

        var pendingTransactions = new TransactionsPool({});
        var node = new Node(`http://${currentNodeUrl}:${httpPort}`, "Just node");

        var testBlockchain = new Blockchain(pendingTransactions, minerAddress);
        
        expect(testBlockchain.pendingTransactions.length).toEqual(testBlockchain.getPendingTransactions().length);
    })
})



