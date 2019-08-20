const net = require('net');
const logger = require('./src/Utils/logger');
const { prepareNetworkMapData, jsonDecodeObj } = require('./src/Utils/networking');
const { POOL_ADDRESS, POOL_PORT } = require('./src/Utils/config');

let peers = [];

const server = net.createServer((socket) => {

    socket.on('error', (err) => {
        logger.error(`socket error: ${err}`);
    });

    socket.on('data', (obj) => {

        logger.info(`${obj}`);
        let hostInfo = jsonDecodeObj(obj);

        if (hostInfo.needData) {
            logger.log('verbose', `Requested list of all users!`);
        } else {
            if (hostInfo.connected) {
                peers.push([
                        hostInfo.ip,
                        hostInfo.port,
                        hostInfo.name
                    ]
                );
                logger.log('info', `Added new user to list! ${hostInfo.ip}:${hostInfo.port}`);
            } else {
                logger.log('verbose', 'Deleting disconnected user...');
                peers.forEach((peerInfo, index, object) => {
                    const ip = peerInfo[0];
                    const port = peerInfo[1];
                    if (hostInfo.ip === ip && hostInfo.port === port)
                        object.splice(index, 1);
                });
            }
        }
    });

    let data = prepareNetworkMapData(peers);
    socket.write(data);

    socket.on('close', () => {
        logger.log('verbose', 'SOCKED CLOSED');
    });
});

server.on('connection', () => {
    logger.log('verbose', 'New connection');
});

setInterval(()=>{
    logger.log('debug', `map: ${peers}`);
},5000);

server.listen(POOL_PORT, POOL_ADDRESS);
logger.log('info', `Signaling server listening on: ${POOL_ADDRESS+':'+POOL_PORT}`);