const SHA256 = require('crypto-js/sha256');

class Block {
    constructor(index, prevHash, transactions, prevProof) {
        this.index = index;
        this.proof = prevProof;
        this.transactions = transactions;
        this.hash = this.hashValue();
        this.prevHash = prevHash;
        this.timestamp = Date.now();
    }

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

    hasValidTransactions() {
        for (const transaction of this.transactions) {
            if (!transaction.isValid())
                return false;
        }
        return true;
    }
}

module.exports = Block;