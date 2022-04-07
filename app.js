const path = require('path');

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(bodyParser.json());
app.use(cors());

const fortuneRoute = require('./routes/fortune');

app.use(express.static(path.join(__dirname, 'public')));

app.use(fortuneRoute);

app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
  });   

const server_port = 3000;

app.listen(server_port);

console.log('server is started')