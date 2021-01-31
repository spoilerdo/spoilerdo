const axios = require('axios');

async function webrequest(url, method) {
    const config = {
        url,
        method
    };
    try {
        return await axios(config);
    } catch (error) {
        console.error(error);
    }
}

module.exports = webrequest;