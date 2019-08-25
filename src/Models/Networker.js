const net = require('net');
const express = require('express');
const config = require('../Utils/config');
const logger = require('../Utils/logger.js');
const {
    jsonEncodeObj,
    jsonDecodeObj,
    decodeNetworkMapData,
    SYN,
    ACK,
    prepareSYN
} = require('../Utils/networking');


class Networker {
    /**
     *
     * @param blockchain
     * @param signal
     * @param ip
     * @param port
     * @param name
     */
    constructor(
        blockchain,
        signal = false,
        ip = config.IP,
        port = config.PORT,
        name = config.NAME)
    {
        this.ip = ip;
        this.port = port;
        this.connected = false;
        this.canGossip = true;
        this.name = name;
        this.peerList = null;
        this.blockchain = blockchain;

        if (signal)
            this.signal();
    }

    /**
     * This function signal own data to signaling server on connect and disconnect event.
     * @param isConnected
     * @param needData
     */
    signal(isConnected = true, needData = false) {
        this.connected = isConnected;
        const signal = new net.Socket();
        signal.connect(3500, '127.0.0.1', () => {
            logger.log('debug', `connected to signaling server`);

            if (needData) {
                const request = jsonEncodeObj({needData: true});
                signal.end(request, () => {
                    logger.log('verbose', `Sent request for all users in pool`);
                });
            } else {
                signal.end(this.networkingInfo, () => {
                    logger.log('verbose', `Sent my own data to signaling server `);
                });
            }
        });

        signal.on('data', (buffer) => {
            this.peerList = decodeNetworkMapData(buffer);
            this.canGossip = true;
        });

        signal.on('close', () => {
            logger.log('verbose', `Signaling server connection closed`);
            this.canGossip = true;
        });

        signal.on('error', (error)=>{
            logger.log('error', 'signal client ' + error);

        });

        signal.on('end', () => {
            logger.log('verbose', 'Connection ended');
        })

    }

    /**
     * Server which is crucial to gossiping between nodes
     * Peer [ B ]
     * It handles requests from peer [ A ]
     */
    createServer() {
        this.server = net.createServer((socket) => {
            this.connected = true;
            socket.on('error', (error) => {
                logger.log('error', 'createServer client ' + error);
            });

            socket.on('data', (obj) => {
                let data = jsonDecodeObj(obj);
                if(data.syn) {
                    this.canGossip = false;
                    let ackPacket = this.checkSYNandPrepareACK(data);
                    if (ackPacket === false)
                        socket.end();
                    if (ackPacket) {
                        socket.write(ACK(this.blockchain, ackPacket));
                    }
                } else if (data.ack2) {

                    let myIds = this.blockchain.listOfId;
                    let payloadIds = data.payload.map(index => index.index);

                    payloadIds.forEach(id => {
                        if(myIds.indexOf(id) < 0) {
                            const missingBlocks = data.payload.filter( block => {
                                return block.index === id;
                            });

                            const missingBlock = missingBlocks[0];
                            this.blockchain.insertReceivedBlock(missingBlock.index, missingBlock.data);
                        }
                    });

                    data.payload.map((item) => {
                        if (item.data) {
                            const myBlock = this.blockchain.getBlock(item.index);
                            let data = Networker.extractDataFromItem(item);
                            myBlock.update(data);
                        }
                    });
                    socket.destroy();
                }
            });

            socket.on('close', () => {
                logger.log('verbose', 'Socked closed.');
                this.canGossip = true;
            });

        })
            .on('error', (error) => {
                this.disconnect();
                logger.log('error', `Error while starting server ${error}`);
            })
            .on('close', () => {
                logger.log('warn', `My server closed!`);
            })
            .listen(this.port, this.ip);
        logger.log('info', `Started server on port ${this.port}`);
    }

    /**
     * Starts the api server on given port
     * @param port
     */
    createApiServer(port = config.API_SERVER_PORT) {
        const api = express();
        const bodyParser = require('body-parser');

        api.use(bodyParser.urlencoded({extended: true}));
        api.use(bodyParser.json());

        const routes = require('../Api/routes');
        routes(api, this);

        api.listen(port);
        console.log('blockchain API server started on port: ' + port);
    }

    /**
     * Peer [ A ]
     * peer A connect to peer B and sends syn request
     * @param port
     * @param ip
     */
    gossipWithPeer(port,ip) {
        const payload =  new net.Socket();
        payload.connect(port, ip, () => {
            this.canGossip = false;
            let dataToSync = prepareSYN(this.blockchain);
            payload.write(SYN(this.blockchain, dataToSync));

            payload.on('data', (obj) => {
               let data = jsonDecodeObj(obj);
               if (data.ack) {
                   const ackPayload = this.checkACKandPrepareACK2(data);
                   payload.write(ACK(this.blockchain, ackPayload, true));
               } else if (data.msg) {
                   logger.log('info', `${data.msg}`);
               }
            });

            payload.on('drain', () => {
                logger.log('error', `data was darined`);
            });

            payload.on('error', (error) => {
                logger.log('error', `Error while exanging data: ${error}`);
            });

            payload.on('end', () => {
                logger.log('verbose', `Connection Ended`);
                this.canGossip = true;
            });
        });
    }

    /**
     * Check Synchronize packet and prepare Acknowledge response
     * @param data
     * @returns { Array | boolean }
     */
    checkSYNandPrepareACK(data) {
        let ackPayload;
        if ((this.blockchain.signature !== data.signature)) {
            logger.log('info', `Given blockchain signature is diffrent, checking for changes`);

            ackPayload = data.payload.map(item => {

                const container = {};
                const myBlock = this.blockchain.getBlock(item.index);

                container['index'] = item.index;
                container['timestamp'] = item.timestamp;

                //if given data about block exists
                if(myBlock) {
                    if (item.timestamp < myBlock.timestamp){
                        container['data'] = Networker.extractDataFromBlock(myBlock);
                    } else if (item.timestamp > myBlock.timestamp) {
                        //
                    }
                }
                return container;
            });

            let myIds = this.blockchain.listOfId;
            let payloadIds = ackPayload.map(index => index.index);

            const allId = myIds.concat(payloadIds);
            const uniqueIds = [...new Set(allId)];

            uniqueIds.forEach(id => {
              if(payloadIds.indexOf(id) < 0) {
                  const missingBlock = this.getMissingBlock(id);
                  ackPayload.push(missingBlock);
              }
            });

        } else {
            logger.log('info', `No changes in blockchain, aborting sync`);
            return false;
        }

        return ackPayload;
    }

    /**
     * Chceck Acknowledge packet and prepare Acknowledge 2 response
     * @param data
     * @returns { Array }
     */
    checkACKandPrepareACK2(data) {
        return data.payload.map(item => {
            const container = {};
            container['index'] = item.index;
            container['timestamp'] = item.timestamp;

            const myBlock = this.blockchain.getBlock(item.index);

            if (myBlock) {
                if (!item.data) {

                    container['data'] = Networker.extractDataFromBlock(myBlock);

                } else {

                    let data = Networker.extractDataFromItem(item);
                    myBlock.update(data);
                    container['data'] = data;
                }
            } else {

                if (item.data) {
                    this.blockchain.insertReceivedBlock(item.index, item.data);
                }
            }

            return container;
        });
    }

    /**
     *
     * @param item
     * @returns {{prevHash: *, proof: *, transactions: *, hash: *, timestamp: *}}
     */
    static extractDataFromItem(item) {
        return {
            'proof': item.data.proof,
            'transactions': item.data.transactions,
            'hash': item.data.hash,
            'prevHash': item.data.prevHash,
            'timestamp': item.timestamp
        }
    }

    /**
     *
     * @param Block
     * @returns {{prevHash: *, proof: *, transactions: *, hash: *, timestamp: *}}
     */
    static extractDataFromBlock(Block) {
        return {
            'proof': Block.proof,
            'transactions': Block.transactions,
            'hash': Block.hash,
            'prevHash': Block.prevHash,
            'timestamp': Block.timestamp
        }
    }

    get myPort() {
        return this.port
    }

    get networkingInfo() {
        return jsonEncodeObj({
                'connected' : this.connected,
                'ip': this.ip,
                'port': this.port,
                'name': this.name
            }
        );
    }

    get allPeers() {
        return new Promise(resolve => {
            this.signal(true, true);
            resolve(this.peerList)
        });
    }

    /**
     *
     * @param id
     * @returns {{data: {prevHash: *, proof: *, transactions: *, hash: *, timestamp: *}, index: *, timestamp: *}}
     */
    getMissingBlock(id) {
        const block = this.blockchain.getBlock(id);
        return {
                index: block.index,
                timestamp: block.timestamp,
                data: Networker.extractDataFromBlock(block)
            };
    }

    /**
     * Disconnect from pool and signal to signaling server.
     * @returns {Promise<any>}
     */
    disconnect() {
        this.canGossip = false;
        const self = this;
        return new Promise((resolve, reject) => {
            logger.info('disconnecting...');
            self.connected = false;
            self.signal(false);
            setInterval(()=>{
                resolve('Disconnected from server');
            },1000)
        });
    }
}

module.exports = Networker;
