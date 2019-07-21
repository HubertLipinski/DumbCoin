const BlockChain = require('./Models/Blockchain');
const Networker = require('./Models/Networker.js');
const { logger } = require('./Utils/logger.js');

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
        this.timestamp = Date.now();

        this.networker = new Networker(this.blockChain);
        this.networker.createServer();

        setTimeout(()=>{

            let list = this.networker.allPeers;
            if(list.size > 0) {

                const randomPeer = Math.floor(Math.random() * list.size);

                if (list.has(randomPeer)) {
                    const peer =  list.get(randomPeer);
                    console.log(peer);
                    const port = peer[1];
                    const ip = peer[0];

                    this.networker.gossipWithPeer(port,ip);
                } else {
                    logger.info(`There's no one to connect, please wait.`)
                }
            }
        },1000);

        setTimeout(()=>{
            console.log("----------------------------------------------");
           console.log(this.blockChain.getChain());
        },15000);



    }
}

module.exports = Cluster;