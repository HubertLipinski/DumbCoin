const BlockChain = require('./Models/Chain');

const SHA256 = require('crypto-js/sha256');

const STATES = {
    CREATED: 'cluster created',
    SYNC: 'sync',
    IDLE: 'idle',
    INVALID: 'invalid'
};

class Cluster {
    constructor(id) {
        this.id = id;
        this.hostInfo = null;
        this.pool = null;
        this.blockChain = new BlockChain();
        this.state = STATES.CREATED;
        this.timestamp = Date.now();
    }

    updateHostInfo(info) {
        this.hostInfo = info;
    }

    info() {
        console.log(this);
    }

}

module.exports = Cluster;