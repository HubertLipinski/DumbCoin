//signaling server helpers

const SYN = (blockChain) => {
    return jsonEncodeObj(
        {
            syn: true,
            ack: false,
            ack2: false,
            signature: blockChain.signature,
            blocks: blockChain.blocks,
            currentTransactions: blockChain.currentTransactions
        }
    )
};

const ACK = (blockChain, second=false) => {
    return jsonEncodeObj(
        {
            syn: false,
            ack: !second,
            ack2: second,
            signature: blockChain.signature,
            blocks: blockChain.blocks,
            currentTransactions: blockChain.currentTransactions
        }
    )
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
    ACK
};