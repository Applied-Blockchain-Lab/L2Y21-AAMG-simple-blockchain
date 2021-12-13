const blockchain = require('../models/blockchain');

exports.getAccountBalance = (req, res) => {
   let balance = 0;

   if (req.params.addressHash === null){
       res.end("Address hash not set.");
   }

   res.json(blockchain.getAccountBalance(req.params.addressHash));
};