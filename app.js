const express = require("express");
const bodyParser = require("body-parser");
// const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(bodyParser.json());
// app.use(cors());
// app.use(axios)\

app.get("/bazi-god", (req, res, next) => {
  let date = req.query.date;
  let time = req.query.time;
  let haveHour = 1
  if (!req.query.time) {
    time = "null"
    haveHour = 0
  }
  axios.get(`http://35.187.245.238:5101/api/bazi/${date}/${time}`)
  .then( respond => {
    let data = respond.data
    res.send(getGodCount(data, haveHour));
    // next();
  })
});

app.get("/bazi-element", (req, res, next) => {
  let date = req.query.date;
  let time = req.query.time;
  let haveHour = 1;
  if (!req.query.time) {
    time = "null";
    haveHour = 0;
  }
  axios
    .get(`http://35.187.245.238:5101/api/bazi/${date}/${time}`)
    .then((respond) => {
      let data = respond.data;
      res.send(getElementCount(data, haveHour));
    });
});

const getGodCount = (natal, haveHour) => {
      let godCount = [0,0,0,0,0,0,0,0,0,0,0]
      if(haveHour == 1){
        godCount[natal.hour.god.code]++
      }
      godCount[natal.month.god.code]++
      godCount[natal.year.god.code]++

      if(haveHour == 1){
        natal.hour.hidden_stem.forEach((hour) => {
        godCount[hour.god.code]++;
      });
      }
      natal.day.hidden_stem.forEach((day) => {
        godCount[day.god.code]++;
      });
      natal.month.hidden_stem.forEach((month) => {
        godCount[month.god.code]++;
      });
      natal.year.hidden_stem.forEach((year) => {
        godCount[year.god.code]++;
      });
      godCount = godCount.map(
        (element) => parseFloat((element / Math.max(...godCount)).toFixed(3))
      );
      return godCount
    }

    const getElementCount = (natal, haveHour) => {
      elementCount = [0, 0, 0, 0, 0];
      //output
      //0 = earth
      //1 = wood
      //2 = fire
      //3 = metal
      //4 = water
      if(haveHour == 1){
        elementCount[natal.hour.heaven_element.code % 5]++;
      }
      elementCount[natal.day.heaven_element.code % 5]++;
      elementCount[natal.month.heaven_element.code % 5]++;
      elementCount[natal.year.heaven_element.code % 5]++;

      if(haveHour == 1){
        elementCount[natal.hour.earth_element.code % 5]++;
      }
      elementCount[natal.day.earth_element.code % 5]++;
      elementCount[natal.month.earth_element.code % 5]++;
      elementCount[natal.year.earth_element.code % 5]++;

      if(haveHour == 1){
      natal.hour.hidden_stem.forEach((hour) => {
        elementCount[hour.element.code % 5]++;
      });
      }
      natal.day.hidden_stem.forEach((day) => {
        elementCount[day.element.code % 5]++;
      });
      natal.month.hidden_stem.forEach((month) => {
        elementCount[month.element.code % 5]++;
      });
      natal.year.hidden_stem.forEach((year) => {
        elementCount[year.element.code % 5]++;
      });
      elementCount = elementCount.map((element) =>
        parseFloat((element / Math.max(...elementCount)).toFixed(3))
      );
      return elementCount
    }

app.use("/", (req, res, next) => {
  res.send("Catch all");
  next();
});



app.listen(3000);
