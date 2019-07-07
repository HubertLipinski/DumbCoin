const {
    jsonEncodeObj,
    jsonDecodeObj,
    decodeNetworkMapData,
    SYN,
    ACK,
    prepareSYN
} = require('../Utils/networking');

const net = require('net');
const { logger } = require('../Utils/logger.js');

class Networker {
constructor(blockchain, ip='127.0.0.1', port=32093, name='dumbCoinNetworker') {

        let test = 0;

        this.ip = ip;
        this.port = port;
        this.name = name;
        this.peerList = null;
        this.blockchain = blockchain;

        this.signal();

        if(test === 1) {
            setTimeout(()=>{
                this.blockchain.fakeBlock();
                console.log(this.blockchain.getChain());

                // this.gossipWithPeer(3001, '127.0.0.1');
            },1000)
        }

    }

    signal() {
        //connect to signaling server, send own data get list of all users in pool
        const signal = new net.Socket();
        signal.connect(3500, '127.0.0.1', () => {
            logger.log('debug', `connected to signaling server`);
            signal.end(this.networkingInfo, () => {
                // console.log('transfered data');
            });
        });

        signal.on('data', (buffer) => {
            this.peerList = decodeNetworkMapData(buffer);
        });

        signal.on('close', () => {
            logger.log('debug', `Signaling server connection closed`);
        });

        signal.on('error', (error)=>{
            logger.log('error', 'client error: '+error);

        });

        signal.on('end', () => {
            logger.log('debug', 'Connection ended');
        })

    }

    createServer() {
        const server = net.createServer((socket) => {

            socket.on('error', (err) => {
                logger.log('error', 'client error: '+err);
            });

            //B
            socket.on('data', (obj) => {

                let data = jsonDecodeObj(obj);
                if(data.syn) {

                    let ackPacket = this.checkSYNandPrepareACK(data);
                    if (ackPacket) {
                        socket.write(ACK(this.blockchain, ackPacket));
                    } else {
                        socket.end(
                            jsonEncodeObj({
                                    msg: "No changes in blockchain, aborting sync"
                            })
                        );
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
                logger.log('info', 'Socked closed.');
            });

        }).listen(this.port, this.ip);
        logger.log('info', `Started server on port ${this.port}`);
    }

    //A
    //peer a connect to peer b and sends syn request
    gossipWithPeer(port,ip) {
        const payload =  new net.Socket();
        payload.connect(port, ip, (socket) => {

            let dataToSync = prepareSYN(this.blockchain);

            if (!this.blockchain.checkChain())
                throw new Error("You can't manipulate blockchain's data!");

            payload.write(SYN(this.blockchain, dataToSync));

            payload.on('data', (obj) => {
               let data = jsonDecodeObj(obj);
               if (data.ack) {
                   const ackPayload = this.checkACKandPrepareACK2(data);
                   payload.write(ACK(this.blockchain, ackPayload, true));
               } else if (data.msg) {
                   console.log(data.msg);
               }
            });

            payload.on('drain', () => {
                console.log('data was darined');
            });

            payload.on('error', () => {
                console.log('Error while exanging data');
            });

            payload.on('end', () => {
                console.log('ended connection');
            });
        });
    }

    checkSYNandPrepareACK(data) {

        let ackPayload;
        if ((this.blockchain.signature !== data.signature)) {
            console.log("Given blockchain signature is diffrent, checking for changes");

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
                  // console.log(this.getMissingBlock(id));
                  ackPayload.push(missingBlock);
              }
            });

        } else {
            console.log("No changes in blockchain, aborting sync");
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

        console.log('ack 2 payload ',ack2Payload);

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

}

module.exports = Networker;