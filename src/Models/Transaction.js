const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {
    constructor(sender, receiver, amount) {
        this.sender = sender;
        this.receiver = receiver;
        this.amount = amount;
        this.timestamp = Date.now();
    }

    calculateHash() {
        return SHA256(this.sender + this.receiver + this.amount + this.timestamp).toString();
    }

    signTransaction(signingKey) {
        //check the key
        if (signingKey.getPublic('hex') !== this.sender) {
            throw new Error('You cant sign this transaction!')
        }

        const transactionHash = this.calculateHash();
        const sign = signingKey.sign(transactionHash, 'base64');
        this.signature = sign.toDER('hex');
    }

    isValid() {
        //this transaction from the server as a reward for mined block
        //todo change the address
        if (this.sender === null)
            return true;

        if (!this.signature || this.signature.length === 0) {
            throw new Error('No signature found!');
        }

        const publicKey = ec.keyFromPublic(this.sender, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }

}

module.exports = Transaction;