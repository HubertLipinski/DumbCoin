const BlockChain = require('./src/Models/Chain');
const Transaction = require('./src/Models/Transaction');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('265b53451b36a1562207829e2902904b93e6d8abf566216221a9d9f8a85eb353');
const myWalletAddress = myKey.getPublic('hex');

const blockChain = new BlockChain();



const transaction1 = new Transaction(myWalletAddress, myWalletAddress, 10);
transaction1.signTransaction(myKey);
blockChain.addTransaction(transaction1);

blockChain.mineCurrentTransactions(myWalletAddress);

console.log("balance: ", blockChain.getBalanceOfAddress(myWalletAddress));

console.log("Is ckchain valid?: ", blockChain.checkChain());
console.log(blockChain.getCurrentTransactions());

//todo add express and socket.io functionality