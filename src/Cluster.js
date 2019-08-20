const BlockChain = require('./Models/Blockchain');
const Networker = require('./Models/Networker.js');
const logger = require('./Utils/logger.js');
const { GOSSIP_INTERVAL, USER_PUBLIC_KEY } = require('./Utils/config');

/**
 * This class is my representation of User in peer to peer network.
 * Every user starts with its own copy of blockchain wich must be synchronized beetwen other peers in network - using my own implementation of gossip protocol
 * Peers known about each other through sygnaling server (signalhub) and are automaticly connected to a pool.
 * Cluster communicates with every other component in blockchain
 * @class Cluster
 */
class Cluster {
    constructor() {
        this.blockChain = new BlockChain();
        this.networker = new Networker(this.blockChain);
        this.networker.createServer();
        this.networker.createApiServer();
        this.list = this.fetchList();

        setInterval(()=>{
            this.fetchList()
                .then(() => {
                    this.gossip()
                });
        }, GOSSIP_INTERVAL || 10000);

        setInterval(()=>{
            this.mine();
        }, 1000);

    }

    async fetchList() {
        logger.verbose('Fetching list...');
        try {
            this.list = await this.networker.allPeers
        } catch (err) {
            logger.error(err);
        } finally {
            logger.verbose('List fetched!');
        }
    }

    gossip() {
        if (this.networker.canGossip) {
            const list = this.list;
            if(list.size >= 1) {
                const randomPeer = Math.floor(Math.random() * list.size);
                if (list.has(randomPeer)) {
                    const peer =  list.get(randomPeer);
                    const port = peer[1];
                    const ip = peer[0];
                    if (port !== this.networker.myPort) {
                        try {
                            logger.info(`Gossiping with: ${ip+":"+port+" random peer: [ " + randomPeer} ]`);
                            this.networker.gossipWithPeer(port,ip);
                        } catch (exception) {
                            logger.error(`Catched error while gossiping: ${exception}`)
                        }
                    }
                }
            } else {
                logger.info(`There's no one to connect, please wait.`)
            }
        }
    }

    mine() {
        if (process.env.BREAK !== true) {
            try {
                this.networker.blockchain.mineCurrentTransactions(USER_PUBLIC_KEY);
            } catch (exception) {
                logger.error(`Catched error while mining: ${exception}`)
            }
        }
    }
}

module.exports = Cluster;
