const hash = require('object-hash');

class Block {
    constructor(index, prevHash, transactions, prevProof) {
        this.index = index;
        this.proof = prevProof;
        this.transactions = transactions;
        this.prevHash = prevHash;
        this.timestamp = Date.now();
    }

    hashValue() {
        return hash(this);
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