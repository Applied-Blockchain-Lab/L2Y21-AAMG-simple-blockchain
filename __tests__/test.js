require('dotenv').config();

const SERVER_URL = "http://localhost" + ":" + "3001/";
const axios = require('axios');

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

// TO DO
describe('POST /blocks/receiveNewBlock', () => {
    it('should accept new block if hash is related to the previous block', async () => {
        // TO DO
    });
});

describe('POST /blockchain/nodes/registerAndBroadcast', () => {
    it('should fail node registration if node address is null', async () => {
        await axios.post(SERVER_URL + "blockchain/nodes/registerAndBroadcast").then((res) => {
            expect(res.data.note).toEqual("New node registration failed.");
        });
    });
});

// TO DO
describe('POST /blockchain/nodes/registerAndBroadcast', () => {
    it('should register node and add the peer to other nodes\' lists', async () => {
        // TO DO
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

// TO DO
describe('POST /blockchain/nodes/registerNode', () => {
    it('should fail node registration if node address is null', async () => {
        // TO DO
    });
});

describe('POST /blockchain/nodes/registerNodesBulk', () => {
    it('should fail nodes registration if provided array of nodes is null', async () => {
        await axios.post(SERVER_URL + "blockchain/nodes/registerNodesBulk").then((res) => {
            expect(res.data.note).toEqual("Bulk registration failed.");
        });
    });
});

// TO DO
describe('POST /blockchain/nodes/registerNodesBulk', () => {
    it('should fail node registration if node address is null', async () => {
        // TO DO
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

// TO DO
describe('POST /transactions/broadcast', () => {
    it('should return error message if transaction is invalid', async () => {
        // TO DO 
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
            expect(res.data).toBe("Invalid block hash.");
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





