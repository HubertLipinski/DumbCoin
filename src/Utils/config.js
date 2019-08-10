require('dotenv').config();

const IP =  process.env.NETWORKER_IP;
const PORT =  process.env.NETWORKER_PORT;
const NAME =  process.env.NETWORKER_NAME;
const GOSSIP_INTERVAL =  process.env.GOSSIP_INTERVAL;
const LOG_LEVEL =  process.env.LOG_LEVEL;

module.exports = {
    IP,
    PORT,
    NAME,
    GOSSIP_INTERVAL,
    LOG_LEVEL
};