const BlockChain = require('./Models/Chain');

const blockChain = new BlockChain();

console.log("Check block: ", blockChain.checkBlock());

blockChain.createTransaction("jan", "adam", 50);
blockChain.createTransaction("foo", "bar", 1337);


//test of wallet ballance and
blockChain.mineCurrentTransactions('wallet').then(
    () => {
        console.log("DONE", blockChain.getBalanceOfAddress('wallet')); //expected: 0
        blockChain.createTransaction("test1", "test2", 2);
        blockChain.mineCurrentTransactions('2').then(
            () => {
                console.log("DONE", blockChain.getBalanceOfAddress('wallet')); //expected: 50
            });
    });

//todo add express and socket.io functionality