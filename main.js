const BlockChain = require('./Models/Chain');

const blockChain = new BlockChain(null);

console.log("Check block: ", blockChain.checkBlock());

blockChain.newTransaction("jan", "adam", 50);
blockChain.newTransaction("foo", "bar", 1337);


//todo add express and socket.io functionality