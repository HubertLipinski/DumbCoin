const Block = require('./Block');
const Transaction = require('./Transaction');

const { isProofValid, generateProof } = require('../Utils/proof');

class Blockchain {
    constructor() {
        this.blocks = [Blockchain.createGenesisBlock()];
        this.currentTransactions = [];
        this.miningReward = 50;
        this.nodes = [];
    }

    static createGenesisBlock() {
        return new Block(0,1,[],0);
    }

    addNode(node) {
        this.nodes.push(node);
    }

    mineBlock(block) {
        this.blocks.push(block);
        console.log("Block mined: ", block.hashValue());

    }

    mineCurrentTransactions(rewardAddress) {
            if(this.currentTransactions.length === 1) {
                console.log("Mining...");
                const prevBlock = this.lastBlock();
                process.env.BREAK = false;
                const block = new Block(prevBlock.getIndex()+1, prevBlock.hashValue(), this.currentTransactions);
                const { proof, dontMine } =  generateProof(prevBlock.getProof());
                block.setProof(proof);
                this.currentTransactions = [];
                if (dontMine !== 'true') {
                    this.mineBlock(block);
                    this.currentTransactions = [
                        new Transaction(null, rewardAddress, this.miningReward)
                    ];
                }
            }
    }

    addTransaction(transaction) {
        if(transaction.sender === transaction.receiver)
            throw new Error('You cannot send money to yourself!');

        if(!transaction.sender || !transaction.receiver)
            throw new Error('Transaction must have sender and receiver!');

        if(!transaction.isValid())
            throw new Error('Cannot add invalid transaction!');

        this.currentTransactions.push(transaction);
    }

    getCurrentTransactions() {
        return JSON.stringify(this.currentTransactions);
    }

    getBalanceOfAddress(address) {
        let balance = 0;
        for (const block of this.blocks) {
            for(const transaction of block.transactions) {
                if(transaction.sender === address)
                    balance -= transaction.amount;
                if(transaction.receiver === address)
                    balance += transaction.amount;
            }
        }
        return balance;
    }

    lastBlock() {
        return this.blocks[this.blocks.length - 1];
    }

    getChain() {
        return this.blocks;
    }

    checkChain() {
        for (let i=1; i<this.blocks.length; i++) {
            const currentBlock = this.blocks[i];
            const prevBlock = this.blocks[i-1];

            if(!currentBlock.hasValidTransactions())
                return false;

            if (currentBlock.prevBlockHash() !== prevBlock.hashValue())
                return false;

            if (!isProofValid(prevBlock.getProof(), currentBlock.getProof()))
                return false;

        }
        return true;
    }
}

module.exports = Blockchain;