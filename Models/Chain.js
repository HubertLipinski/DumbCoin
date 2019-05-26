const Block = require('./Block');
const Transaction = require('./Transaction');

const { isProofValid, generateProof } = require('../Check/proof');

class Blockchain {
    constructor(blocks) {
        this.blocks = blocks || [new Block(0,1,[],0)];
        this.currentTransactions = [];
        this.nodes = [];
    }

    addNode(node) {
        this.nodes.push(node);
    }

    mineBlock(block) {
        this.blocks.push(block);
        console.log("Block mined!");
        console.log(JSON.stringify(this.getChain(),null, '\t'));
    }

    async newTransaction(sender, receiver, amount) {
        const transaction = new Transaction(sender, receiver, amount);
        this.currentTransactions.push(transaction);
        if (this.currentTransactions.length === 2) {
            console.log("Mining...");
            const prevBlock = this.lastBlock();
            process.env.BREAK = false;
            const block = new Block(prevBlock.getIndex()+1, prevBlock.hashValue(), this.currentTransactions);
            //check block validation
            const { proof, dontMine } = await generateProof(prevBlock.getProof());
            block.setProof(proof);
            this.currentTransactions = [];
            if (dontMine !== 'true') {
                this.mineBlock(block);
            }
        }
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