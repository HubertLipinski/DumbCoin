const Block = require('./Block');
const Transaction = require('./Transaction');

const { isProofValid, generateProof } = require('../Check/proof');

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
        console.log("Block mined: ", block);
        console.log("Block mined: ", block.hashValue());

    }

    async mineCurrentTransactions(rewardAddress) {
            if(this.currentTransactions.length === 2) {
                console.log("Mining...");
                const prevBlock = this.lastBlock();
                process.env.BREAK = false;
                const block = new Block(prevBlock.getIndex()+1, prevBlock.hashValue(), this.currentTransactions);
                const { proof, dontMine } = await generateProof(prevBlock.getProof());
                block.setProof(proof);
                this.currentTransactions = [];
                if (dontMine !== 'true') {
                    this.mineBlock(block);
                    this.currentTransactions = [
                        new Transaction('server', rewardAddress, this.miningReward)
                    ];
                }
            }
    }

    createTransaction(sender, receiver, amount) {
        const transaction = new Transaction(sender, receiver, amount);
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

    checkBlock() {
        const blocks = this;
        let prevBlock = blocks[0];
        for (let i=0; i<blocks.length; i++) {
            const currentBlock = blocks[i];
            if (currentBlock.prevBlockHash() !== prevBlock.hashValue()) {
                return false;
            }
            if (!isProofValid(prevBlock.getProof(), currentBlock.getProof())) {
                return false;
            }
            prevBlock = currentBlock;
        }
        return true;
    }
}

module.exports = Blockchain;