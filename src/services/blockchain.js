const blockchain = require('../models/blockchain');

exports.startMiner = (req, res) => {
    let minerAddress = req.body.minerAddress;
    blockchain.startMining(minerAddress);

    res.send('Miner started');
};
