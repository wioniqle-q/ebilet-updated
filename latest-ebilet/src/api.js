const axios = require('axios');

const headers = {
  'Authorization': 'Basic ZGl0cmF2b3llYnNwOmRpdHJhMzQhdm8u'
};

async function postRequest(url, body) {
  try {
    const response = await axios.post(url, body, { headers });
    return response.data;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

module.exports = { postRequest };
