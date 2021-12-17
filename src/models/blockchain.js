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
    this.minerStarted = false;
  }

  createGenesisBlock() {
    const genesisDate = '08/09/2021';
    return new Block({'0': {
      
      fromAddress: "GENESIS",
      toAddress: "0467672ef21bea1b98528f5262102d9cdb8ebeb04af762145d85868c626c21abe9912fd8e554e6dc742ada69e0f239917a3ab34ef1f752d2ef7a917c7bec029491",
      amount: 100
    
    }}, genesisDate, '0');
  }

  getBlockchain() {
    return this;
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

    let block = new Block(this.pendingTransactions.getAllPending(), Date.now(), this.getLastBlock().hash);
    block.mineBlock(this.difficulty);

    if(this.chain[this.chain.length - 1].hash == block.previousHash) {
      this.chain.push(block);
      this.pendingTransactions.draw();
      this.emit('BlockMined', [block, txReward]);
    } else {
      console.log('Block rejected')
    }
    
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
    const sender = transaction.fromAddress;
    const currentBalanceOfSender = this.getBalanceOfAddress(sender);
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

    for (let i = 1; i < chainLength; i++) {
      const currentBlock = chain[i];
      const previousBlock = chain[i - 1];
      
      if (!Block.prototype.hasValidTransactions(currentBlock)) {
        return false;
      }

      if (currentBlock.hash !== Block.prototype.calculateHash(currentBlock)) {
        console.log(`Block ${i} has been corrupted`);
        return false;
      }

      if (i > 0 && currentBlock.previousHash !== previousBlock.hash) {
        console.log(`Block ${i - 1} has been corrupted`);
        return false;
      }
    }

    const genesisBlock = chain[0];
    const isEmptyTransactions = Object.keys(genesisBlock.transactions).length === 0;

    if (genesisBlock.previousHash !== '0' || 
        genesisBlock.timestamp !== '08/09/2021' || 
        !isEmptyTransactions ||
        genesisBlock.nonce !== 0) {

        console.log(`Genesis block is not valid`);
        return false;
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

    if(!this.minerStarted){
      
      setInterval(() => {

        if (this.pendingTransactions.currentTransactionCount > 1)
        this.minePendingTransactions();
  
      }, 5 * 1000);
      
      this.minerStarted = true;
      return 'Miner started';
      
    } else {
      return 'Miner already started';
    }

    

  }
}

module.exports = Blockchain;