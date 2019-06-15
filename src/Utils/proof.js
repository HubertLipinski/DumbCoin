const crypto = require('crypto');

/**
 * Difficulty of the problem solving algorithm
 * @type {number}
 */
let DIFFICULTY = 3;

/**
 * This function generates proof for block.
 * Its used in mining process
 * @param prevProof
 * @returns {{dontMine: string, proof: number}|*}
 */
const generateProof = (prevProof) => {
       let proof = Math.random() * 2137;
       const dontMine = process.env.BREAK;
       if (isProofValid(prevProof, proof) || dontMine === 'true') {
           return ({ proof, dontMine });
       } else {
           return generateProof(prevProof);
       }
};


/**
 * This functions checks for valid solution. If current hash starts with DIFFICULTY amount of '0' returns true, otherwise return false
 * @param prevProof
 * @param currentProof
 * @returns {boolean}
 */
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