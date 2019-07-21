require('dotenv').config();

const IP =  process.env.NETWORKER_IP;
const PORT =  process.env.NETWORKER_PORT;
const NAME =  process.env.NETWORKER_NAME;

module.exports = {
    IP,
    PORT,
    NAME
};