const Transaction = require('../Models/Transaction');
const { USER_PRIVATE_KEY, USER_PUBLIC_KEY } = require('../Utils/config');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate(USER_PRIVATE_KEY);

module.exports = function(api, networker) {

    api.get('/chain', (req, res) => {
        res.json({
            'blockchain': networker.blockchain.chain
        });
    });

    api.get('/transactions', (req, res) => {
        res.json({
            'transactions': networker.blockchain.transactions
        });
    });

    api.post('/transactions', (req, res) => {
        const receiver = req.body.receiver;
        const amount = req.body.amount;
        const balance = networker.blockchain.getBalanceOfAddress(USER_PUBLIC_KEY);
        if (balance <= 0 || (balance - amount) < 0) {
            res.json({
                'status': 'You don\'t have enough money to send this transaction! You can send max: '+balance
            });
        } else if (amount <= 0) {
            res.json({
                'status': 'Amount must be grater than 0!'
            });
        }
        else {
            try {
                const transaction = new Transaction(USER_PUBLIC_KEY, receiver, amount);
                transaction.signTransaction(myKey);
                networker.blockchain.addTransaction(transaction);
                res.json({
                    'status': 'Transaction added!'
                });
            } catch (exception) {
                res.status(500).json({
                    'status': 'Error: '+exception
                });
            }
        }
    });

    api.get('/wallet', (req, res) => {
        const balance = networker.blockchain.getBalanceOfAddress(USER_PUBLIC_KEY);
        res.json({'status': 'Current balance: '+balance});
    });

    api.use((req, res) => {
        res.status(404)
            .send({
                status: req.originalUrl + ' not found'
            })
    });

};