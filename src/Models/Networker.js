const net = require('net');
const config = require('../Utils/config');
const { logger } = require('../Utils/logger.js');
const {
    jsonEncodeObj,
    jsonDecodeObj,
    decodeNetworkMapData,
    SYN,
    ACK,
    prepareSYN
} = require('../Utils/networking');


class Networker {
    constructor(
        blockchain,
        ip = config.IP,
        port = config.PORT,
        name = config.NAME)
    {

        let test = 1;

        this.ip = ip;
        this.port = port;
        this.connected = false;
        this.name = name;
        this.peerList = null;
        this.blockchain = blockchain;

        this.signal();

        if(test === 1) {
            setTimeout(()=>{
                // this.blockchain.fakeBlock();
                logger.silly(`${JSON.stringify(this.blockchain.getChain())}`);
                // throw new Error("eee");
            },3000)
        }
    }

    signal(isConnected = true) {
        //connect to signaling server, send own data get list of all users in pool
        this.connected = isConnected;
        const signal = new net.Socket();
        signal.connect(3500, '127.0.0.1', () => {

            logger.log('debug', `connected to signaling server`);

            signal.end(this.networkingInfo, () => {
                logger.log('verbose', `Sent my own data to signaling server `);
            });

        });

        signal.on('data', (buffer) => {
            this.peerList = decodeNetworkMapData(buffer);
        });

        signal.on('close', () => {
            logger.log('verbose', `Signaling server connection closed`);
        });

        signal.on('error', (error)=>{
            logger.log('error', 'client ' + error);

        });

        signal.on('end', () => {
            logger.log('verbose', 'Connection ended');
        })

    }

    createServer() {
        this.server = net.createServer((socket) => {
            this.connected = true;
            socket.on('error', (error) => {
                logger.log('error', 'client ' + error);
            });

            //B
            socket.on('data', (obj) => {

                let data = jsonDecodeObj(obj);
                if(data.syn) {

                    let ackPacket = this.checkSYNandPrepareACK(data);
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

                    //update data
                    data.payload.map((item) => {
                        if (item.data) {
                            const myBlock = this.blockchain.getBlock(item.index);
                            let data = Networker.extractDataFromItem(item);
                            myBlock.update(data);
                        }
                    });

                }
            });

            socket.on('close', () => {
                logger.log('verbose', 'Socked closed.');
            });

        })
            .on('error', (error) => {
                this.disconnect();
                logger.log('error', `Error while starting server ${error}`);
            })
            .on('close', () => {
                this.disconnect()
                    .then((msg) => {
                        logger.log('warn', `My server closed!`);
                    })
                    .catch((error) => {
                        logger.log('error', `Error while disconnecting from server, aborting...` + error);
                    });
                logger.log('warn', `My server closed!`);
            })
            .listen(this.port, this.ip);
        logger.log('info', `Started server on port ${this.port}`);


        setTimeout(()=>{
            this.server.close();
        }, 10000)

    }

    //A
    //peer a connect to peer b and sends syn request
    gossipWithPeer(port,ip) {
        const payload =  new net.Socket();
        payload.connect(port, ip, (socket) => {

            let dataToSync = prepareSYN(this.blockchain);

            if (!this.blockchain.checkChain()) {
                logger.log('error', "You can\'t manipulate blockchain\'s data!");
                payload.end();
                throw new Error("You can't manipulate blockchain's data!");
            }

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

            payload.on('error', () => {
                logger.log('error', `Error while exanging data`);
            });

            payload.on('end', () => {
                logger.log('verbose', `Connection Ended`);
            });
        });
    }

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

    checkACKandPrepareACK2(data) {

        const ack2Payload = data.payload.map(item => {
            //check if block given data exists.
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

        return ack2Payload;
    }

    static extractDataFromItem(item) {
        return {
            'proof': item.data.proof,
            'transactions': item.data.transactions,
            'hash': item.data.hash,
            'prevHash': item.data.prevHash,
            'timestamp': item.timestamp
        }
    }

    static extractDataFromBlock(Block) {
        return {
            'proof': Block.proof,
            'transactions': Block.transactions,
            'hash': Block.hash,
            'prevHash': Block.prevHash,
            'timestamp': Block.timestamp
        }
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
        return this.peerList;
    }

    getMissingBlock(id) {
        const block = this.blockchain.getBlock(id);
        return {
                index: block.index,
                timestamp: block.timestamp,
                data: Networker.extractDataFromBlock(block)
            };
    }

    disconnect() {
        const self = this;
        return new Promise(function(resolve, reject) {
            logger.info('disconnecting...');
            self.connected = false;
            self.signal(false);
            //silly
            setInterval(()=>{
                resolve('Disconnected from server');
            },1000)

        });
    }
}

module.exports = Networker;