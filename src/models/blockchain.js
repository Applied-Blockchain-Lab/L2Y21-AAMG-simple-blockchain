const Block = require('./block');
const Transaction = require('./transaction');

class Blockchain {
  constructor(pendingTransactions, minerAddress) {

    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = pendingTransactions;
    this.miningReward = 100;
    this.minerAddress = minerAddress;

  }

  createGenesisBlock() {
    const genesisDate = '08/09/2021';
    return new Block({}, genesisDate, '0');
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
      let blockTxs = block.getTransactions();
      
      for (const key in blockTxs) {
        if (key === txHash) {
          console.log('tx found')
          return txs[key];
        }
      }

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

    const calculatedReward = this.miningReward + this.sumOfFees();

    const txReward = new Transaction(null, miningRewardAddress, calculatedReward);
    this.pendingTransactions.addTx(txReward);

    let block = new Block(this.pendingTransactions.getAllPending(), Date.now(), this.getLastBlock().hash);
    block.mineBlock(this.difficulty);

    this.chain.push(block);
    this.pendingTransactions.draw();

  }

  sumOfFees() {
    const txs = this.pendingTransactions.getAllPending();
    let sum = 0;
    for (const key in txs) {
      sum += +txs[key].getFee();
    }
    return sum;
  }

  addTransaction(transaction) {

    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error('Transaction must include from and to address');
    }

    if (!transaction.isValid()) {
      throw new Error('Cannot add invalid transaction to chain');
    }

    this.pendingTransactions.addTx(transaction);

  }

  getBalanceOfAddress(address) {

    let balance = 0;

    for(let i = 0; i < this.chain.length; i++) {
      let blockTxs = this.chain[i].transactions;
      
      for (const key in blockTxs) {

        if (blockTxs[key].toAddress == address) {
          balance += blockTxs[key].amount;
        }

        if (blockTxs[key].fromAddress == address) {
          balance -= blockTxs[key].amount;
        }

      }
      
    }
    return balance;
  }

  isChainValid(chain) {

    const chainLength = chain.length;

    for (let i = 0; i < chainLength; i++) {
      const currentBlock = chain[i];
      const previousBlock = chain[i - 1];

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

  isChainLonger(chain) {
    return chain.length > this.chain;
  }

  startMining(miningAddress) {

    setInterval(() => {

      if (this.pendingTransactions.length)
      this.minePendingTransactions(miningAddress);

    }, 5 * 1000);

  }
}

module.exports = Blockchain;