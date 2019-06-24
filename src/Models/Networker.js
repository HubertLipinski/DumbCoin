const {
    jsonEncodeObj,
    jsonDecodeObj,
    decodeNetworkMapData,
    SYN,
    ACK,
    prepareSYN
} = require('../Utils/networking');

const net = require('net');

class Networker {


    constructor(blockchain, ip='127.0.0.1', port=3479, name='dumbCoinNetworker') {

        let test = 1;

        this.ip = ip;
        this.port = port;
        this.name = name;
        this.peerList = null;
        this.blockchain = blockchain;

        this.signal();

        //create server an listen on signaled port.
        //also on connection end send signal to signaling server and delte from array


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
        signal.connect(3000, '127.0.0.1', () => {
            console.log('connected to signaling server');
            signal.end(this.networkingInfo, () => {
                console.log('transfered data');
            });
        });

        signal.on('data', (buffer)=>{
            let response = decodeNetworkMapData(buffer);
            console.log("recived: ",response);
            this.peerList = response;
            console.log("networker peer list: ",this.peerList);
        });

        signal.on('close', () => {
            console.log('connection closed.');
        });

        signal.on('error', (error)=>{
            console.log("client error: ", error);
        });

        signal.on('end', () => {
            console.log('ended signal');
        })

    }

    createServer() {
        const server = net.createServer((socket) => {

            socket.on('error', (err) => {
                console.log("client error: ", err);
            });

            //B
            socket.on('data', (obj) => {

                let data = jsonDecodeObj(obj);
                if(data.syn) {
                    console.log("RECEIVED SYN PACKET", data);
                    //porównanie danych

                    console.log("packet ssss", this.checkSYNandPrepareACK(data));
                    let ackPacket = this.checkSYNandPrepareACK(data);

                    socket.write(ACK(this.blockchain, ackPacket));
                    console.log("B ACK packet send", ackPacket);
                } else if (data.ack) {
                    console.log('B ACK PACKET RECEIVED',data);
                } else if (data.ack2) {
                    console.log('B ACK 2 PACKET RECEIVED',data);
                    console.log(data.payload);

                    data.payload.map((item) => {
                        console.log("afer", item);
                        // const myBlock = this.blockchain.getBlock(item.index);
                       // let data = Networker.extractDataFromItem(item);
                       // myBlock.update(data);
                    })

                } else {
                    console.log('client recived data: ',data)
                }

            });

            socket.on('close', (socket) => {
                console.log('SOCKET CLOSED', socket);
            });

        }).listen(this.port, this.ip);
        console.log("im listening at port: ", this.port);
    }

    //A
    //peer a connect to peer b and sends syn request
    gossipWithPeer(port,ip) {
        const payload =  new net.Socket();
        payload.connect(port, ip, (socket) => {

            let dataToSync = prepareSYN(this.blockchain);
            payload.write(SYN(this.blockchain, dataToSync));
            console.log("sent SYN request",SYN(this.blockchain, dataToSync));

            payload.on('data', (obj) => {
               let data = jsonDecodeObj(obj);

               if (data.ack) {
                   console.log('A ACK PACKET RECEIVED', data);

                   //if data is not given add my data to ack2 packet
                   const ackPayload = this.checkACKandPrepareACK2(data);

                   //send ACK2 packet.
                   payload.write(ACK(this.blockchain, ackPayload, true));
               }
            });

            payload.on('drain', () => {
                console.log('data was darined while wtiring!');
            });

            payload.on('end', () => {
                console.log('ended connection');
            });
        });
    }

    //check the given data with own, if data is newer, replace it
    //send ack packet
    checkSYNandPrepareACK(data) {

        let canExchangeData = true;

        if (!data.isValid) {
            canExchangeData = false;
            console.log("Given data was invalid");
        }

        //canExchangeData &&
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
                        //my data is newer, place in the ack payload
                        //request data by not placing it in request
                        console.log('given data is older!');

                        container['data'] = Networker.extractDataFromBlock(myBlock);

                    } else if (item.timestamp > myBlock.timestamp) {
                        //
                    }
                }
                return container;
            });

            let myIds = this.blockchain.listOfId;
            ackPayload.forEach(item => {
                if(myIds.includes(item.index)) {
                    console.log(item, "jest w pakiecie");
                } else {
                    ackPayload.push(
                        {
                            index: item.index,
                            timestamp: item.timestamp
                        }
                    );
                    console.log(item, "NIE MA W PAKIECIE");
                }
            });

        } else {
            ackPayload = null;
        }

        console.log('ack payload ',ackPayload);
        return ackPayload;
    }

    //if payload doesnt have data field add my own data (i have newer data)
    checkACKandPrepareACK2(data) {

        const ack2Payload = data.payload.map(item => {
            //check if block given data exists.
            const container = {};
            container['index'] = item.index;
            container['timestamp'] = item.timestamp;

            const myBlock = this.blockchain.getBlock(item.index);

            if (myBlock) {
                if (!item.data){
                    //doesnt have data field
                    console.log('putting my newer data');
                    container['data'] = Networker.extractDataFromBlock(myBlock);

                } else {
                    //update my data
                    console.log("updating my data", item.data);

                    let data = Networker.extractDataFromItem(item);
                    myBlock.update(data);
                    container['data'] = data;
                }
            } else {
                console.log("wake the fuck up samuraj, we have a block to add!");
                if (item.data){
                    //doesnt have data field
                    console.log('block doesnt exist but have data');
                } else {
                    //update my data
                    console.log("block doesnt exist dont have data");

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

}

module.exports = Networker;