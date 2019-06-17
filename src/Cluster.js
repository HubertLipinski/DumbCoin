const BlockChain = require('./Models/Blockchain');

const net = require('net'),
      nssocket = require('nssocket'),
      io = require('socket.io-client');

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
     */
    constructor() {
        this.id = null;
        this.blockChain = new BlockChain();
        this.state = STATES.CREATED;
        this.timestamp = Date.now();

        //test only
        const socket = io('http://127.0.0.1:3000');

    }


}

module.exports = Cluster;