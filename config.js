const dotenv = require('dotenv');

dotenv.config();

const port = process.env.PORT;
const botToken = process.env.TOKEN;

module.exports = {
    port,
    botToken
}