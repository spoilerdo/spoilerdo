const axios = require('axios');

async function webrequest(url, method, token) {
  const config = {
    url,
    method,
  };
  try {
    const response = await axios(config);
    return response;
  } catch (error) {
    console.error(error);
  }
}

module.exports = webrequest;
