const BlockChain = require('./Models/Blockchain');

const SHA256 = require('crypto-js/sha256');

/**
 * States in which a cluster may be.
 * CREATED - The cluster has been created and its not synchronized with other peers in network.
 * IDLE - Cluster is doing nothing
 * SYNC - Data is being synchronized between peers
 * INVALID - Cluster has invalid information or has been corupted
 * @type {{CREATED: string, IDLE: string, SYNC: string, INVALID: string}}
 */
const STATES = {
    CREATED: 'cluster created',
    SYNC: 'sync',
    IDLE: 'idle',
    INVALID: 'invalid cluster'
};

/**
 * This class is my representation of User in peer to peer network.
 * Every user starts with its own copy of blockchain wich must be synchronized beetwen other peers in network - using my own implementation of gossip protocol
 * Peers known about each other through sygnaling server (signalhub) and are automaticly connected to a pool.
 * Cluster communicates with every other component in blockchain
 * @class Cluster
 */
class Cluster {
    /**
     * This is the Cluster constructor
     * @param sw Swamp instance wich holds all information about network and it's peers
     */
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