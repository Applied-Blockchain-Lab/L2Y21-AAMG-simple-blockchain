const Block = require('./block');
const Transaction = require('./transaction');

class Blockchain {
  constructor() {

    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
    this.miningReward = 100;

  }

  createGenesisBlock() {
    const genesisDate = '08/09/2021';
    return new Block([], genesisDate, '0');
  }

  getLastBlock() {
    return this.chain[this.chain.length - 1];
  }

  getAllBlocks() {
    return this.chain;
  }

  getPendingTransactions() {
    return this.pendingTransactions;
  }

  getTx(txHash) {

    this.chain.forEach(block => {
      block.getTransactions().forEach(tx => {
        if (tx.hash === txHash) {
          return tx;
        }
      })
    });

  }

  getBlock(blockHash) {
    this.chain.forEach(block => {
      if (block.hash === blockHash) {
        return block;
      }
    });
  }

  minePendingTransactions(miningRewardAddress) {

    const txReward = new Transaction(null, miningRewardAddress, this.miningReward);
    this.pendingTransactions.push(txReward);

    let block = new Block(this.pendingTransactions, Date.now(), this.getLastBlock().hash);
    block.mineBlock(this.difficulty);

    this.chain.push(block);
    this.pendingTransactions = [];

  }

  addTransaction(transaction) {

    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error('Transaction must include from and to address');
    }

    if (!transaction.isValid()) {
      throw new Error('Cannot add invalid transaction to chain');
    }

    this.pendingTransactions.push(transaction);

  }

  getBalanceOfAddress(address) {

    let balance = 0;

    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.fromAddress === address) {
          balance -= tx.amount;
        }

        if (tx.toAddress === address) {
          balance += tx.amount;
        }
      }
    }

    return balance;

  }

  isChainValid() {

    const chainLength = this.chain.length;

    for (let i = 0; i < chainLength; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (!currentBlock.hasValidTransactions()) {
        return false;
      }

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        console.log(`Block ${i} has been corrupted`);
        return false;
      }

      if (i > 0 && currentBlock.previousHash !== previousBlock.hash) {
        console.log(`Block ${i - 1} has been corrupted`);
        return false;
      }
    }

    console.log('Chain is valid');

    return true;

  }

  startMining(miningAddress) {

    setInterval(() => {

      if (this.pendingTransactions.length)
      this.minePendingTransactions(miningAddress);

    }, 5 * 1000);

  }
}

module.exports = Blockchain;