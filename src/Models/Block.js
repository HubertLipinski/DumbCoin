const SHA256 = require('crypto-js/sha256');
const Transaction = require('./Transaction');

/**
 *  This is Block class. It's crucial element of blockchain.
 *  Blocks are being connected via hash of the previous block.
 *  @class Block
 */
class Block {
    /**
     * @constructs
     * Construction of the Block class
     *
     * @param index Id of the block
     * @param prevHash Hash of the previous block.
     * @param transactions Instance of Transaction class.
     * @param prevProof Proof number of previous Block
     *
     * @see Transaction
     */
    constructor(index, prevHash, transactions, prevProof) {
        this.index = index;
        this.proof = prevProof;
        this.transactions = transactions;
        this.hash = this.hashValue();
        this.prevHash = prevHash;
        this.timestamp = Date.now();
    }

    /**
     * This function checks if the block has all valid transactions
     * @returns {boolean}
     */
    hasValidTransactions() {
        for (let transaction of this.transactions) {
            transaction = Transaction.fromResponse(transaction);
            if (!transaction.isValid())
                return false;
        }
        return true;
    }

    /**
     * Update block from given data
     * @param data
     */
    update(data) {
        this.proof = data.proof;
        this.transactions = data.transactions;
        this.hash = data.hash;
        this.prevHash = data.prevHash;
        this.timestamp = data.timestamp;
    }

    /**
     * This function returns hash value of Block
     * @returns {hash}
     */
    hashValue() {
        return SHA256(this.prevHash + this.timestamp + JSON.stringify(this.transactions)).toString();
    }

    setProof(proof) {
        this.proof = proof;
    }

    getProof() {
        return this.proof;
    }

    prevBlockHash() {
        return this.prevHash;
    }

    getIndex() {
        return this.index;
    }
}

module.exports = Block;