const BlockChain = require('./Models/Blockchain');

const SHA256 = require('crypto-js/sha256');

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
     * @param sw Swamp instance wich holds all information about network and it's peers
     */
    constructor(sw) {
        this.blockChain = new BlockChain();
        this.state = STATES.CREATED;
        this.timestamp = Date.now();

        sw.on('connect', (peer) => {

            this.peer = peer;
            this.hostInfo = peer.address();
            this.peerList = sw.peers;

            //create chanell to recive data
            const server = net.createServer((c) => {
                // 'connection' listener
                console.log('client connected');
                c.on('end', () => {
                    console.log('client disconnected');
                });
                c.write('hello\r\n');
                c.pipe(c);
            });

            server.listen({
                port: this.hostInfo.port,
                host: this.hostInfo.address,
                exclusive: true
            });
            this.reciveData();

            // setInterval(()=>{
            //     this.synchronizeData();
            // },1000);

        });

        sw.on('peer', (peer, id) => {
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

    /**
     * This function iterates over all peers in list and takes their network information
     * @returns {Array | null} Returns array of objects - only other hosts in network (current cluster data excluded)
     */
    getNetworkData() {
        if (this.peerList) {
            let connectedPeers = [];
            for (let index = 0; index < this.peerList.length; index++) {
                const peer = this.peerList[index];
                connectedPeers.push({
                        port: peer.remotePort,
                        family: peer.remoteFamily,
                        address: peer.remoteAddress
                    }
                );
            }
            return connectedPeers;
        }
        return null;
    }

    synchronizeData() {
        let data = this.getNetworkData();
        //todo get the random id between 0 and data.length
        console.log("data 0;",data[0]);

        const client = net.createConnection({
                port: data[0].port,
                host: data[0].address
            },
            () => {
            // 'connect' listener
            console.log('connected to server!');
            client.write('world!\r\n');
        });
        client.on('data', (data) => {
            console.log("received data: ",data.toString());
            client.end();
        });
        client.on('end', () => {
            console.log('disconnected from server');
        });

    }

    info() {
        console.log(this.sw.peers);
    }

}

module.exports = Cluster;