const {
    jsonEncodeObj,
    jsonDecodeObj,
    decodeNetworkMapData,
    SYN,
    ACK
} = require('../Utils/networking');

const net = require('net');

class Networker {

    constructor(blockchain, ip='127.0.0.1', port=3002, name='dumbCoinNetworker') {

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
                this.blockchain.mineBlock(this.blockchain.lastBlock());
                // this.gossipWithPeer(3001, '127.0.0.1');
            },1000)
        }

    }

    signal() {
        //connect to signaling server, send own data get list of all users in pool
        const signal = new net.Socket();
        signal.connect(3000, '127.0.0.1', () => {
            console.log('connected to signaling server');
            signal.end(this.getNetworkingInfo(), () => {
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
                    console.log("RECEIVED SYN PACKET",data);
                    //porównanie danych

                    this.checkSYN(data);

                    socket.write(ACK(this.blockchain));
                    console.log("ACK packet send");
                } else if (data.ack) {
                    console.log('ACK PACKET RECEIVED',data);
                } else if (data.ack2) {
                    console.log('ACK2 PACKET RECEIVED',data);
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

    getNetworkingInfo() {
        return jsonEncodeObj({
                    'ip': this.ip,
                    'port': this.port,
                    'name': this.name
                }
            );
    }

    //A
    gossipWithPeer(port,ip) {
        const payload =  new net.Socket();
        payload.connect(port, ip, (socket) => {

           payload.write(SYN(this.blockchain));
           console.log("sent SYN request",SYN(this.blockchain));

           payload.on('data', (obj) => {
               let data = jsonDecodeObj(obj);
               console.log('i have connected to another peer and recived: ', data);
               if (data.ack) {
                   console.log('ACK PACKET RECEIVED',data);
                   //send ACK2 packet.
                   payload.write(ACK(this.blockchain,true));
               } else {
                   console.log('A recived data: ',data)
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

    checkSYN(data) {
        for (let i=0; i<data.blocks.length; i++) {

            //check the given data with own, if data is newer, replace it
            //send ack packet

        }
    }

    getPeerList() {
        return this.peerList;
    }

}

module.exports = Networker;