const express = require('express');
const router = express.Router();

const blockChainService = require('../services/blockchain');

router.post('/startMining', blockChainService.startMiner);

module.exports = router;