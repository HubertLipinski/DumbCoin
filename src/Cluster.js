const BlockChain = require('./Models/Blockchain');
const Networker = require('./Models/Networker.js');
const logger = require('./Utils/logger.js');
const { GOSSIP_INTERVAL, USER_PUBLIC_KEY } = require('./Utils/config');

/**
 * Every user starts with its own copy of blockchain wich must be synchronized between other peers in network - using my own implementation of gossip protocol
 * Peers known about each other through signaling server and are automatically connected to a pool.
 * Cluster communicates with every other component in blockchain
 * @class Cluster
 */
class Cluster {
    constructor() {
        this.blockChain = new BlockChain();
        this.networker = new Networker(this.blockChain);
        this.networker.createServer();
        this.list = this.fetchList();
    }

    /**
     * This function fetching list of active peers in network
     * @returns {Promise<void>}
     */
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

    /**
     * This function is responsible for data exchange between random peers
     */
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

    /**
     * @see gossip
     * Gossiping with given interval
     */
    gossipWithInterval() {
        this.gossipInterval = setInterval(()=>{
            this.fetchList()
                .then(() => {
                    this.gossip()
                });
        }, GOSSIP_INTERVAL || 10000);
    }

    /**
     * Mine current transactions and reward miner
     */
    mine() {
        if (process.env.BREAK !== true) {
            try {
                this.networker.blockchain.mineCurrentTransactions(USER_PUBLIC_KEY);
            } catch (exception) {
                logger.error(`Catched error while mining: ${exception}`)
            }
        }
    }

    /**
     * @see mine
     * Mining with given interval
     */
    mineWithInterval() {
        this.miningInterval = setInterval(()=>{
            this.mine();
        }, 1000);
    }

    /**
     * This function stops mining and gossiping intervals if active
     */
    stop() {
        if (this.gossipInterval)
            clearInterval(this.gossipInterval);
        if(this.miningInterval)
            clearInterval(this.miningInterval);
    }
}

module.exports = Cluster;
