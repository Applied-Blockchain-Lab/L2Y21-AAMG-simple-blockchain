const Block = require('./block');
const Transaction = require('./transaction');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const EventEmitter = require('events');

class Blockchain extends EventEmitter {
  constructor(pendingTransactions, minerAddress) {
    super();
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
    return this.pendingTransactions.getAllPending();
  }

  getTx(txHash) {

    this.chain.forEach(block => {
      let blockTxs = block.getTransactions();
      
      for (const key in blockTxs) {
        if (key === txHash) {
          console.log('tx found')
          return blockTxs[key];
        }
      }

    });

  }

  getAllTxs() {
    let transactions = [];

    this.chain.forEach(block => transactions.push(block.getTransactions()));
  }

  getBlock(blockHash) {
    let res;
    this.chain.forEach(block => {
      if (block.hash === blockHash) {
        res = block;
      }
    });
    return res;
  }

  minePendingTransactions() {

    const calculatedReward = this.miningReward + this.sumOfFees();

    const txReward = new Transaction(null, this.minerAddress, calculatedReward);
    // this.pendingTransactions.addTx(txReward);

    let block = new Block(this.pendingTransactions.getAllPending(), Date.now(), this.getLastBlock().hash);
    block.mineBlock(this.difficulty);

    this.chain.push(block);
    this.pendingTransactions.draw();

    this.emit('BlockMined', [block, txReward]);
  }

  sumOfFees() {
    const txs = this.pendingTransactions.getAllPending();
    let sum = 0;
    for (const key in txs) {
      sum += +txs[key].fee;
    }
    return sum;
  }

  addTransaction(transaction) {

    const currentBalanceOfSender = this.getBalanceOfAddress(transaction.fromAdrress);

    if (currentBalanceOfSender - transaction.amount < 0) {
      throw new Error('Insufficient coins');
    }

    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error('Transaction must include from and to address');
    }

    if (!Transaction.prototype.isValid(transaction)) {
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

  generateKeyPair(){
    const key = ec.genKeyPair();
    const publicKey = key.getPublic('hex');
    const privateKey = key.getPrivate('hex');
    return {publickKey: publicKey, privateKey: privateKey}
  }

  startMining() {

    setInterval(() => {

      if (this.pendingTransactions.currentTransactionCount > 0)
      this.minePendingTransactions();

    }, 5 * 1000);

  }
}

module.exports = Blockchain;