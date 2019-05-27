const DumbCoin = require('./Models/Chain');
const Transaction = require('./Models/Transaction');

const app = require('express')();
const http = require('http').Server(app);
const bodyParser = require('body-parser');
const io = require('socket.io')(http);
const client = require('socket.io-client');
const axios = require('axios');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const dumbCoin = new DumbCoin(io);

const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());

app.get('/', (req, res) => {
    io.emit('connection', {for: 'everyone'});
    res.json('connected!');
});

app.post('/nodes', (req, res) => {
    const { host, port } = req.body;
    console.log(req.body);
    //const port = http.address().port;
    const { callback } = req.query;
    const node = `http://${host}:${port}`;
    const socketNode = [client(node), dumbCoin];
    dumbCoin.addNode(socketNode, dumbCoin);
    if (callback === 'true') {
        console.info(`Added node ${node} back`);
        res.json({ status: 'Added node Back' }).end();
    } else {
        axios.post(`${node}/nodes?callback=true`, {
            host: req.hostname,
            port: PORT,
        }).then((data) => {
            console.info(`Added node ${node}`);
            res.json({ status: 'Added node' }).end();
        }).catch((error) => {
            console.info("problem: ",error);
        });
    }
});

io.on('connection', (socket) => {
    console.info(`Socket connected, ID: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`Socket disconnected, ID: ${socket.id}`);
    });
});



http.listen(PORT, () => {
    console.info('listening on *:', PORT);
});