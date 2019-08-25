const ClusterModel = require('./src/Cluster');
const logger = require('./src/Utils/logger');
const SignalModel = require('./src/Utils/signal');
const BlockChainModel = require('./src/Models/Blockchain');

/**
 * This function prevents fast exit from cluster (CTRL + C),
 * sends inforamtion about cluster disconnect to signaling server
 * @param cluster
 */
const handleClusterExit = (cluster) => {
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
};

const Cluster = (fetch = false, signal = false) => {
  return new ClusterModel(fetch, signal);
};

const Signal = () => {
    return SignalModel;
};

const Blockchain = () => {
    return new BlockChainModel();
};

//todo add wallet

module.exports = {
    Cluster,
    Signal,
    Blockchain,
    handleClusterExit
};