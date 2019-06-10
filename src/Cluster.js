const BlockChain = require('./Models/Chain');

const SHA256 = require('crypto-js/sha256');

const STATES = {
    CREATED: 'cluster created',
    SYNC: 'sync',
    IDLE: 'idle',
    INVALID: 'invalid cluster'
};

class Cluster {
    constructor(sw) {
        this.id = sw.me;
        this.hostInfo = null;
        this.peer = null;
        this.blockChain = new BlockChain();
        this.state = STATES.CREATED;
        this.timestamp = Date.now();

        sw.on('connect', (peer) => {
            this.peer = peer;
            this.hostInfo = peer.address();
            this.reciveData();
            peer.send(JSON.stringify({test:true}))
        });

        sw.on('peer', function (peer, id) {
            console.log('Im now connected to a new peer:', id)
        });

        sw.on('disconnect', (peer, id) => {
            console.log("disconnected: ",id);
        });

    }

    reciveData() {
        this.peer.on('data', (data) => {
            console.log(data)
        });
    }

    info() {
        console.log(this);
    }

}

module.exports = Cluster;