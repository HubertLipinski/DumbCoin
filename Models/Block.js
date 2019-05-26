const crypto = require('crypto');
const Transaction = require('./Transaction');

class Block {
    constructor(index, data, prevHash) {
        this.index = index;
        this.timestamp = Date.now();
    }
}