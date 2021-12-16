const { SHA256 } = require('crypto-js');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {
  constructor(fromAddress, toAddress, amount) {

    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.fee = this.calculateFee();
    this.hash = this.calculateHash();
  }

  calculateFee() {
    const fee = this.amount * 0.03
    if(this.fromAddress !== null)
      this.amount -= fee;
    return fee;
  }

  getFee() {
    return this.fee;
  }

  calculateHash() {

    return SHA256(
      this.fromAddress +
      this.toAddress +
      this.amount + 
      this.fee
    ).toString();

  }

  signTransaction(signerPrivateKey) {
    const key = ec.keyFromPrivate(signerPrivateKey);

    if (key.getPublic('hex') !== this.fromAddress) {
      throw new Error('You cannot sign transactions for other wallets!');
    }

    const sig = key.sign(this.hash, 'base64');
    this.signature = sig.toDER('hex');

  }

  isValid(transactionObj) {

    // if the transaction is a mining reward then there will be no sender but will be valid
    if (transactionObj.fromAddress === null) {
      return true;
    }

    if (!transactionObj.signature || transactionObj.signature.length === 0) {
      throw new Error('No signature in this transaction');
    }

    const publicKey = ec.keyFromPublic(transactionObj.fromAddress, 'hex');
    return publicKey.verify(transactionObj.hash, transactionObj.signature);

  }
}

module.exports = Transaction;