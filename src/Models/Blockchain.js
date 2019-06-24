const Block = require('./Block');
const Transaction = require('./Transaction');

const { isProofValid, generateProof } = require('../Utils/proof');
const SHA256 = require('crypto-js/sha256');

/**
 * This class is the representation of 'blockchain'
 * Blockchain class stores and manages all blocks and transactions
 *  Its the most important aspect of blockchain network
 * @class Blockchain
 */
class Blockchain {
    /**
     * @constructs
     * Constructor of Blockchain class.
     */
    constructor() {
        this.blocks = [Blockchain.createGenesisBlock()];
        this.currentTransactions = [];
        this.miningReward = 50;
        this.signature = this.calculateSignature();
        this.timestamp = Date.now();
    }

    /**
     * This function creates the genesis block
     * @returns {Block}
     */
    static createGenesisBlock() {
        return new Block(0,1,[],0);
    }

    /**
     * This function return unique SHA256 signature of current block
     * @returns {hash}
     */
    calculateSignature() {
        return SHA256(this.blocks + this.currentTransactions + this.miningReward + this.timestamp).toString();
    }

    getSignature() {
        return this.signature;
    }

    /**
     * This functions add block to an array
     * @param block
     */
    mineBlock(block) {
        this.blocks.push(block);
        this.signature = this.calculateSignature();
    }

    fakeBlock(){
        const prevBlock = this.lastBlock();

        let block = new Block (
            Math.round((Math.random()*10 + prevBlock.getIndex()+ 1)),
            prevBlock.hashValue(),
            this.currentTransactions,
        );
        block.setProof(112.333);
        this.blocks.push(block);

        this.signature = this.calculateSignature();
    }

    /**
     * This function is my implementation of 'mining'.
     * It takes the currentTransactions and 'mine it' using prof.js utility
     *
     * @param rewardAddress Wallet address of lucky receiver
     */
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
        this.signature = this.calculateSignature();
    }

    /**
     * This function checks and add transaction to an array
     * @param transaction Transaction to add
     */
    addTransaction(transaction) {
        if(transaction.sender === transaction.receiver)
            throw new Error('You cannot send money to yourself!');

        if(!transaction.sender || !transaction.receiver)
            throw new Error('Transaction must have sender and receiver!');

        if(!transaction.isValid())
            throw new Error('Cannot add invalid transaction!');

        this.currentTransactions.push(transaction);
        this.signature = this.calculateSignature();
    }

    getCurrentTransactions() {
        return JSON.stringify(this.currentTransactions);
    }

    /**
     * It returns the balacne of given wallet
     * @param address Wallet addres
     * @returns {number} Amount of coins in wallet
     */
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

    getBlock(index) {
        return this.blocks[index];
    }

    /**
     * This function check the validity of the blockchain.
     * It check if all the blocks are valid and also checks their transaction
     * @returns {boolean}
     */
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

    get listOfId() {
        return this.blocks.map(index => index.index);
    }
}

module.exports = Blockchain;