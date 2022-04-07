const axios = require('axios');

// default path user
const instance = axios.create({
    baseURL: "https://api.numeiang.app",
})

module.exports = instance
