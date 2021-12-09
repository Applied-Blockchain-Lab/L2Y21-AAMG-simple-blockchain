const SERVER_URL = "http://localhost:1312/";
const axios = require('axios');

describe('GET /', () => {
    it('should return OK status and Hello World message', async () => {
        const res = await axios.get(SERVER_URL);

        expect(res.status).toEqual(200);
        expect(res.data).toEqual("Hello World!");
    });
});