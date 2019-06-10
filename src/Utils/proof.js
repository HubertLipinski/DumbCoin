const crypto = require('crypto');

let DIFFICULTY = 3;

const generateProof = (prevProof) => {
       let proof = Math.random() * 2137;
       const dontMine = process.env.BREAK;
       if (isProofValid(prevProof, proof) || dontMine === 'true') {
           return ({ proof, dontMine });
       } else {
           return generateProof(prevProof);
       }
};



const isProofValid = (prevProof, currentProof) => {
    const difference = currentProof - prevProof;
    const proofString = `difference-${difference}`;
    const hashFunction = crypto.createHash('sha256');
    hashFunction.update(proofString);
    const hexString = hashFunction.digest('hex');
    const difficulty = Array(DIFFICULTY+1).join('0');
    return hexString.startsWith(difficulty);

};

const setDifficulty = (number) => {
    DIFFICULTY = number;
};

const getDifficulty = () => {
    return DIFFICULTY;
};

//todo refactor this code
exports.generateProof = generateProof;
exports.isProofValid = isProofValid;
exports.setDifficulty = setDifficulty;
exports.getDifficulty = getDifficulty;