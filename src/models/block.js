const { SHA256 } = require('crypto-js');
const Transaction = require('./transaction');

class Block {
  constructor(transactions, timestamp = String(new Date()), previousHash = '') {

    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.nonce = 0;
    this.hash = this.calculateHash();

  }

  mineBlock(difficulty) {

    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log(`Block mined: ${this.hash}`);

  }

  calculateHash(block) {

    if (!block) {
      block = this;
    }    

    return SHA256(
      block.transactions +
      block.timestamp +
      block.previousHash + 
      block.nonce
    ).toString();

  }

  hasValidTransactions(block) {

    if (!block) {
      block = this;
    }

    let blockTxs = block.transactions;
      
    for (const key in blockTxs) {
      if(!Transaction.prototype.isValid(blockTxs[key])) {
        return false;
      }
    }

    return true;
  }

  getTransactions() {
    return this.transactions;
  }
}

module.exports = Block;