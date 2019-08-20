require('dotenv').config();

const IP =  process.env.NETWORKER_IP;
const PORT =  process.env.NETWORKER_PORT;
const NAME =  process.env.NETWORKER_NAME;
const GOSSIP_INTERVAL =  process.env.GOSSIP_INTERVAL;
const LOG_LEVEL =  process.env.LOG_LEVEL;
const API_SERVER_PORT =  process.env.API_SERVER_PORT;
const USER_PUBLIC_KEY =  process.env.USER_PUBLIC_KEY;
const USER_PRIVATE_KEY =  process.env.USER_PRIVATE_KEY;
const USER_NAME =  process.env.USER_NAME;
const POOL_ADDRESS =  process.env.POOL_ADDRESS;
const POOL_PORT =  process.env.POOL_PORT;

module.exports = {
    IP,
    PORT,
    NAME,
    GOSSIP_INTERVAL,
    LOG_LEVEL,
    API_SERVER_PORT,
    USER_PRIVATE_KEY,
    USER_PUBLIC_KEY,
    USER_NAME,
    POOL_ADDRESS,
    POOL_PORT,
};