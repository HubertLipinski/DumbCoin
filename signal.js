const net = require('net');

const { prepareNetworkMapData, jsonDecodeObj } = require('./src/Utils/networking');

let peers = [];

const server = net.createServer((socket) => {

    socket.on('error', (err) => {
        console.log("socket error: ", err);
    });

    socket.on('data', (obj) => {
        let hostInfo = jsonDecodeObj(obj);
        peers.push([
                hostInfo.ip,
                hostInfo.port,
                hostInfo.name
            ]
        );
        console.log("added to list, current list: ",peers);
    });

    socket.on('close', (socket) => {
        console.log('SOCKET CLOSED', socket);
    });

    let data = prepareNetworkMapData(peers);
    socket.write(data);
    //socket.pipe(socket);

});

server.on('connection', () => {
    console.log("someone connected!");
});

setInterval(()=>{
    console.log("map: ", peers);
},5000)


//pool
server.listen(3000, '127.0.0.1');

console.log("server listening...");