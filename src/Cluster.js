const BlockChain = require('./Models/Blockchain');
const Networker = require('./Models/Networker.js');

const net = require('net');

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
        this.blockChain = new BlockChain();
        this.state = STATES.CREATED;
        this.timestamp = Date.now();

        this.networker = new Networker(
            this.blockChain
        );
        this.networker.createServer();

        setTimeout(()=>{
            // console.log("networker peer list: ",this.networker.getPeerList());
            let list = this.networker.getPeerList();
            if(list.size > 0) {
                let port = list.get(0)[1];
                let ip = list.get(0)[0];
                this.networker.gossipWithPeer(port,ip)
            }
        },3000);



    }

    gossip() {
        //
    }


}

module.exports = Cluster;