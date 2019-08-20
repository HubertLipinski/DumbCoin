/**
 * Create an Synchronize request
 * @param blockChain
 * @param dataToSync
 * @returns {string}
 * @constructor
 */
const SYN = (blockChain, dataToSync) => {
    return jsonEncodeObj({
            syn: true,
            ack: false,
            ack2: false,
            isValid: blockChain.checkChain(),
            signature: blockChain.signature,
            payload: dataToSync,
        }
    )
};

/**
 * This function handles creating of an Acknowledge response,
 * there are 2 ACK packets in data exchange.
 *
 * @param blockChain
 * @param dataToSync
 * @param second
 * @returns {string}
 * @constructor
 */
const ACK = (blockChain, dataToSync, second=false) => {
    return jsonEncodeObj({
            syn: false,
            ack: !second,
            ack2: second,
            isValid: blockChain.checkChain(),
            signature: blockChain.signature,
            payload: dataToSync,
        }
    )
};

/**
 * This function prepares data to be Synchronized
 * @param blockChain
 * @returns {Array}
 */
const prepareSYN = (blockChain) => {
    let dataToSync = [];
    for (let block of blockChain.blocks) {
        dataToSync.push({
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

/**
 * It prepares Map object to be sent via socket
 * @param data
 * @returns {Buffer}
 */
const prepareNetworkMapData = (data) => {
    return Buffer.from(
        JSON.stringify(
            Array.from(data.entries())
        )
    );
};

const jsonDecodeObj = (obj) => {
    return JSON.parse(obj);
};

const jsonEncodeObj = (obj) => {
    return JSON.stringify(obj);
};

/**
 * It returns Map instance with information about others users in pool
 * @param buffer
 * @returns {Map<string, string|int>}
 */
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