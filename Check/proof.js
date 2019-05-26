const crypto = require('crypto');

const generateProof = (prevProof) => new Promise((resolve) => {
    setImmediate(async () => {
       let proof = Math.random() * 1000001;
       const dontMine = process.env.BREAK;
       if (isProofValid(prevProof, proof) || dontMine === 'true') {
           resolve({proof, dontMine});
       } else {
           resolve(await generateProof(prevProof));
       }
    });
});


const isProofValid = (prevProof, currentProof) => {
    const difference = currentProof - prevProof;
    const proofString = `difference-${difference}`;
    const hashFunction = crypto.createHash('sha256');
    hashFunction.update(proofString);
    const hexString = hashFunction.digest('hex');
    return hexString.includes('000000');

};

exports.generateProof = generateProof;
exports.isProofValid = isProofValid;