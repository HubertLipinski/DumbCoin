const net = require('net');
const logger = require('./logger');
const { prepareNetworkMapData, jsonDecodeObj } = require('./networking');
const { POOL_ADDRESS, POOL_PORT } = require('./config');

let peers = [];

/**
 * Creates a signaling server which provides the data about peers connected to blockchain
 * @type {Server}
 */
const server = net.createServer((socket) => {

    socket.on('error', (err) => {
        logger.error(`socket error: ${err}`);
    });

    socket.on('data', (obj) => {

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
    logger.log('debug', `Data: ${data}`);
    socket.write(data);

    socket.on('close', () => {
        logger.log('verbose', 'SOCKED CLOSED');
    });
});

server.on('connection', () => {
    logger.log('verbose', 'New connection');
});

/**
 * Starts the signaling server
 * @param port
 * @param address
 */
module.exports.start = (port = POOL_PORT, address = POOL_ADDRESS) => {
    server.listen(port, address);
    logger.log('info', `Signaling server listening on: ${address+':'+port}`);
};

/**
 * Return the list of connected peers
 * @returns {Array}
 */
module.exports.peers = () => {
    return peers;
};

/**
 * Clear peer list
 */
module.exports.clearList = () => {
  peers = [];
};
