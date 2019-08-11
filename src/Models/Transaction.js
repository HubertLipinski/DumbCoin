const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

/**
 * This class represent Transaction.
 * Transaction are being made between two people, and require their public key
 * the person who sends the amount must sign the transaction with his key,
 * if the key does not match or the transaction has not been signed, blockchain will not accept it
 * @class Transaction
 */
class Transaction {
    /**
     * @constructs
     * Construction of Transaction class.
     *
     * @param sender Wallet adress of the sender
     * @param receiver Wallet adress of the receiver
     * @param amount Amount of coins to send
     */
    constructor(sender, receiver, amount) {
        this.sender = sender;
        this.receiver = receiver;
        this.amount = amount;
        this.timestamp = Date.now();
    }

    /**
     * This function return calculated hash of the transaction
     * @returns {hash}
     */
    calculateHash() {
        return SHA256(this.sender + this.receiver + this.amount + this.timestamp).toString();
    }

    /**
     * This function checks the provided key and then signs the transaction with it
     * @param signingKey Key wich is used to sign the transaction
     */
    signTransaction(signingKey) {
        if (signingKey.getPublic('hex') !== this.sender) {
            throw new Error('You cant sign this transaction!')
        }

        const transactionHash = this.calculateHash();
        const sign = signingKey.sign(transactionHash, 'base64');
        this.signature = sign.toDER('hex');
    }

    /**
     * This function checks if the the transaction is valid.
     * It is checked first if the sender address is from mine (When we have mining reward transaction) - in that case functions return true
     * In other case function checks if transaction has signature and verify it.
     * @returns {Buffer | Boolean | boolean | * | PromiseLike<boolean>|boolean}
     */
    isValid() {
        if (this.sender === 'MINING REWARD')
            return true;

        if (!this.signature || this.signature.length === 0) {
            throw new Error('No signature found!');
        }

        const publicKey = ec.keyFromPublic(this.sender, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

module.exports = Transaction;