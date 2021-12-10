const blockchain = require('../models/blockchain');

exports.getLatestBlock = (req, res) => {
    res.json(blockchain.getLastBlock());
};

exports.getAllBlocks = (req, res) => {
    res.json(blockchain.getAllBlocks());
};

exports.getBlockByHash = (req, res) => {
    const blocks = blockchain.getAllBlocks();

    blocks.forEach(block => {
        if (block.hash === req.params.hash){
            res.json(block);
        }
    });
};