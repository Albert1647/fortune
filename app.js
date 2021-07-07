const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.post("/bazi-element", (req, res, next) => {
  res.send("<h1>The Notify !! </h1>");
});

app.use("/", (req, res, next) => {
  res.send("Catch all");
  next();
});

app.listen(3000);
