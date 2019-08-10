module.exports = function(api, networker) {

    api.get('/chain', (req, res) => {
        res.send(networker.blockchain.chain);
    });

    api.get('/transactions', (req, res) => {
        res.send(networker.blockchain.transaction);
    });

    api.post('/transactions', (req, res) => {
        res.send(JSON.stringify(req.body));
    });

    api.get('/transactions/:id', (req, res) => {
        res.send('get transaction with id')
    });

    api.use((req, res) => {
        res.status(404)
            .send({
                status: req.originalUrl + ' not found'
            })
    });

};