const SERVER_URL = "http://localhost:3001/";
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
