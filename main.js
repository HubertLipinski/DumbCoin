const Cluster = require('./src/Cluster');
const { logger } = require('./src/Utils/logger');

const POOL_CONFIG = {
    address: 'http://127.0.0.1:9000',
    port: 9000,
    user: {
        username: 'wallet.js',
        private_key: null
    }
};

//todo create sygnaling server

const cluster = new Cluster();

process.on('SIGINT', function() {
    process.stdout.write('\033c');
    logger.warn('Detected CTRL+C COMBINATION, closing nicely... \n \t Waiting for other processes to end...');
    cluster.networker.disconnect()
        .then((msg)=>{
            logger.info(`${msg}`);
            process.exit(1);
        })
        .catch((error) => {
            logger.log('error', `Error while disconnecting from server, aborting...` + error);
        });

});
