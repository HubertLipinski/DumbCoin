//signaling server helpers

const SYN = (blockChain, dataToSync) => {
    return jsonEncodeObj(
        {
            syn: true,
            ack: false,
            ack2: false,
            isValid: blockChain.checkChain(),
            signature: blockChain.signature,
            payload: dataToSync,
        }
    )
};

const ACK = (blockChain, dataToSync, second=false) => {
    return jsonEncodeObj(
        {
            syn: false,
            ack: !second,
            ack2: second,
            isValid: blockChain.checkChain(),
            signature: blockChain.signature,
            payload: dataToSync,
        }
    )
};

const prepareSYN = (blockChain) => {
    let dataToSync = [];
    for (let block of blockChain.blocks) {
        dataToSync.push(
            {
                index: block.index,
                timestamp: block.timestamp,
                data: extractDataFromBlock(block)
            }
        )
    }
    return dataToSync;
};

const extractDataFromBlock = (Block) => {
    return {
        'proof': Block.proof,
        'transactions': Block.transactions,
        'hash': Block.hash,
        'prevHash': Block.prevHash,
        'timestamp': Block.timestamp
    }
};

const prepareNetworkMapData = (data) => {
    return Buffer.from(JSON.stringify(Array.from(data.entries())));
};

const jsonDecodeObj = (obj) => {
    return JSON.parse(obj);
};

const jsonEncodeObj = (obj) => {
    return JSON.stringify(obj);
};

const decodeNetworkMapData = (buffer) => {
    return new Map(JSON.parse(buffer));
};

module.exports = {
    jsonDecodeObj,
    jsonEncodeObj,
    prepareNetworkMapData,
    decodeNetworkMapData,
    SYN,
    ACK,
    prepareSYN

};