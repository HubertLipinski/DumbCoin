const Cluster = require('./src/Cluster');

const POOL_CONFIG = {
    address: 'http://127.0.0.1:9000',
    port: 9000,
    user: {
        username: 'wallet.js',
        private_key: null
    }
};
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const createSwarm = require('webrtc-swarm')
const Signalhub = require('signalhub')
const POOL = Signalhub('DumbCoin', [
    'http://127.0.0.1:9000'
])

const swarm = createSwarm(POOL, {wrtc: require('wrtc')});

const cluster = new Cluster(swarm.me);

swarm.on('connect', (peer, id) => {

    cluster.updateHostInfo(peer.address());
    cluster.info();

    peer.on('data', (data) => {
      //
    });


})

swarm.on('peer', function (peer, id) {
    console.log('connected to a new peer:', id)

})

swarm.on('disconnect', (peer, id) => {
    console.log("disconnected: ",id);
})
