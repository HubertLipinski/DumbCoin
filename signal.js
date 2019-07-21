const net = require('net');

const { prepareNetworkMapData, jsonDecodeObj } = require('./src/Utils/networking');
const { logger } = require('./src/Utils/logger');

let peers = [];

const server = net.createServer((socket) => {

    socket.on('error', (err) => {
        console.log("socket error: ", err);
    });

    socket.on('data', (obj) => {

        logger.info(`${obj}`);
        let hostInfo = jsonDecodeObj(obj);
        
        if (hostInfo.connected) {
            peers.push([
                    hostInfo.ip,
                    hostInfo.port,
                    hostInfo.name
                ]
            );
            logger.log('info', `Added new user to list! ${hostInfo.ip}:${hostInfo.port}`);
        } else {

            logger.log('info', 'Deleting disconnected user...');
            peers.forEach((peerInfo, index, object) => {
                const ip = peerInfo[0];
                const port = peerInfo[1];
                if (hostInfo.ip === ip && hostInfo.port === port)
                    object.splice(index, 1);

            });
        }

    });

    socket.on('close', () => {
        logger.log('verbose', 'SOCKED CLOSED');
    });

    let data = prepareNetworkMapData(peers);
    socket.write(data);

});

server.on('connection', () => {
    logger.log('verbose', 'New connection');
});

setInterval(()=>{
    logger.log('debug', `map: ${peers}`);
},5000);


//pool
server.listen(3500, '127.0.0.1');

logger.log('info', 'Server listening on port: 3500');