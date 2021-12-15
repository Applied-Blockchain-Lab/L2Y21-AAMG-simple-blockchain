class TransactionsPool {

  constructor(transactions) {
    this.transactions = transactions;
    this.currentTransactionCount = Object.keys(this.transactions).length;
  }

  getAllPending() {
    return this.transactions;
  }

  draw() {
    var tx = this.transactions;
    this.transactions = {};
    this.currentTransactionCount = 0;
    return tx;
  }

  addTx(tx) {
    this.transactions[tx.hash] = tx;
    this.currentTransactionCount ++;
  }

  removeTx(tx) {
    delete this.transactions[tx.hash];
    this.currentTransactionCount --
  }

  addTxArr(txArr) {
    txArr.forEach(tx => this.addTx(tx));
  }

  removeTxArr(txArr) {
    txArr.forEach(tx => this.removeTx(tx));
  }
}

module.exports = TransactionsPool;