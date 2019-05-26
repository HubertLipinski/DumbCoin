const Block = require('./Models/Block');
const BlockChain = require('./Models/Chain');
const blockChain = new BlockChain(null);

const hash = require('object-hash');

let PROFF = 15;

let validProff = (proof) => {
    let guess = hash(proof);
    // console.log("Hashing: ", guess);
    return guess == hash(PROFF);
};

let proofOfWork = () => {
  let proof = 0;
  while(true) {
      if(!validProff(proof)) {
          proof++;
      } else {
          break;
      }
  }
};

blockChain.newTransaction("jan", "adam", 50);
blockChain.newTransaction("adam", "jan", 50);
