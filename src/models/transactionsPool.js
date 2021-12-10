class TransactionsPool {

  constructor() {
    this.transactions = {}
    this.maxTransactions = 30;
  }

  getAllPending() {
    return this.transactions;
  }

  draw() {
    var tx = this.transactions;
    this.transactions = {};
    return tx;
  }

  addTx(tx) {

    if (this.transactions.length >= this.maxTransactions) {
      console.log('Current block cant handle more transactions');
    } else {
      this.transactions[tx.hash] = tx;
    } 
    
  }

  removeTx() {
    delete this.transactions[tx.hash];
  }

  addTxArr(txArr) {
    txArr.forEach(tx => this.addTx(tx));
  }

  removeTxArr(txArr) {
    txArr.forEach(tx => this.removeTx(tx));
  }
}

module.exports = TransactionsPool;