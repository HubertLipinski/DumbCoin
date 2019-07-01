const Cluster = require('./src/Cluster');

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
