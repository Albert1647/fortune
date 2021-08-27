const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(bodyParser.json());
app.use(cors());

// Parse element code
let elementCode = [
  { name: "earth", code: 0 },
  { name: "wood", code: 1 },
  { name: "fire", code: 2 },
  { name: "metal", code: 3 },
  { name: "water", code: 4 },
];

let colorTable = {
  0: [1, 4, 16, 12, 15, 13, 8, 7],
  1: [3, 8, 16, 11, 2, 7],
  2: [1, 6, 16, 15, 2, 8],
  3: [1, 5, 11, 2, 9, 16, 7],
  4: [1, 2, 11, 14, 8, 7, 13],
};

app.get("/bazi-god", (req, res, next) => {
  let date = req.query.date;
  let time = req.query.time;
  let haveHour = 1;
  if (!req.query.time) {
    time = "null";
    haveHour = 0;
  }
  axios
    .get(`http://35.187.245.238:5101/api/bazi/${date}/${time}`)
    .then((response) => {
      let data = response.data;
      res.send(getGodCount(data, haveHour));
    });
});

app.get("/bazi-element", (req, res, next) => {
  let date = req.query.date;
  let time = req.query.time;
  let haveHour = 1;
  if (typeof req.query.time === 'undefined') {
    time = "null";
    haveHour = 0;
  }
  
  axios
    .get(`http://35.187.245.238:5101/api/bazi/${date}/${time}`)
    .then((response) => {
      let data = response.data;
      res.send(getElementCount(data, haveHour));
      resolve();
    });
});

app.get("/get-user-color", (req, response, next) => {
  let userID = req.query.user_id;
  axios
    .get(`http://35.187.245.238:5102/api/admin/users/${userID}`)
    .then(res => {
      console.log("----------------")
      console.log("user id  = " + userID)
      let userData = res.data;
      let dateOfBirth = userData.date_of_birth;
      let timeOfBirth = userData.time_of_birth;
      let haveHour = 1;
      if (timeOfBirth === "") {
        timeOfBirth = "null";
        haveHour = 0
      }
      let promises = [];
      let userElement
      promises.push(
        axios
        .get(`http://35.187.245.238:5101/api/bazi/${dateOfBirth}/${timeOfBirth}`)
        .then(response => {
          let natal = response.data;
          userElement = countElement(natal, haveHour);
          console.log('user', userElement)
        })
        .catch(err => {
          console.log(err)
        })
      );

      let today = new Date();
      today = today.toISOString().slice(0, 10);
      let todayElement

      promises.push(
        axios.get(`http://35.187.245.238:5101/api/bazi/${today}/null`)
        .then(response => {
          let natal = response.data;
          todayElement = countElement(natal, 0)
          console.log('today', todayElement);
        })
        .catch(err => {
          console.log(err)
        })
      );

    Promise.all(promises).then(() => {
      let sum = userElement.map( (userElement, index) => {
        return Number((userElement + todayElement[index]).toFixed(3));
      });
      console.log("user + today ", sum)
      let colorArray = getColor(sum);
      console.log("color output", colorArray)
      response.send(colorArray)
      console.log('finished')
    })
    .catch(err => {
      console.log(error)
    });
    })
    .catch(err => {
      response.send("User Not Found")
    });
    
});

const countElement = (natal, haveHour) => {

  let percentArray = [0, 0, 0, 0, 0]

  if (haveHour === 1) {
    percentArray[natal.hour.heaven_element.code % 5] += 10
  }
  percentArray[natal.day.heaven_element.code % 5] += 10

  percentArray[natal.month.heaven_element.code % 5] += 10

  percentArray[natal.year.heaven_element.code % 5] += 10

  if (haveHour === 1) {
  percentArray[natal.hour.earth_element.code % 5] += 10
  }
  percentArray[natal.day.earth_element.code % 5] += 10
  percentArray[natal.month.earth_element.code % 5] += 10
  percentArray[natal.year.earth_element.code % 5] += 10


  if (haveHour === 1) {
    let computedCap = getCap(natal.hour.hidden_stem)
    natal.hour.hidden_stem.forEach((hour) => {
      percentArray[hour.element.code % 5] += computedCap;
    });
  }

  computedCap = getCap(natal.day.hidden_stem)
  natal.day.hidden_stem.forEach((day) => {
    percentArray[day.element.code % 5] += computedCap;
  });
  computedCap = getCap(natal.month.hidden_stem)
  natal.month.hidden_stem.forEach((month) => {
    percentArray[month.element.code % 5] += computedCap;
  });
  computedCap = getCap(natal.year.hidden_stem)
  natal.year.hidden_stem.forEach((year) => {
    percentArray[year.element.code % 5] += computedCap;
  });

  // percentArray = percentArray.map(element => {
  //   return Number(element.toFixed(3));
  // })

  return percentArray
  // let result = getColor(percentArray)
};

const getCap = (hiddenStemArray) => {
  return Number((5 / hiddenStemArray.length).toFixed(3));
};

const getColor = (countedElement) => {
  // หาอินเวอร์ส
  let elementData = countedElement.map((element, index) => {
    return {
      code: index,
      value: (element * 100 - 100) * -1,
    };
  });
  // เรียงจากมากไปน้อย
  elementData = elementData.sort((a, b) => {
    return b.value - a.value;
  });
  // หาผลรวม
  let sum = 0;
  elementData.forEach((data) => {
    sum = sum + data.value;
  });
  // หาอัตราส่วน
  let proportion = sum / 3;
  let result = [];
  // หาธาตุที่ต้องเติม
  for (let i = 0, count = 0; i < elementData.length && count < 3; i++) {
    let n = Math.ceil(elementData[i].value / proportion);
    for (let j = 0; j < n; j++) {
      result.push(elementCode[elementData[i].code].code);
      // เอาแค่ 3 ตัว ถ้ามี 4 ตัว
      result.length === 4 ? result.pop() : null;
      count++;
    }
  }

  console.log("---------------")
  console.log("element", result)

  let range = [0,0,0,0,0];
  let ans = []
  let a = result.map(code => {
    range[code] += Math.floor(Math.random() * colorTable[code].length);
    // console.log(range)

    if(ans.includes(colorTable[code][range[code] % colorTable[code].length])){
      console.log("Found Duplicate Color!! Re-Randoming")
      while(ans.includes(colorTable[code][range[code] % colorTable[code].length])){
        range[code] += Math.floor(Math.random() * colorTable[code].length);
      }
    }

    ans.push(colorTable[code][range[code] % colorTable[code].length])

    return  colorTable[code][range[code] % colorTable[code].length] 
    
  })

  return a

};

const getGodCount = (natal, haveHour) => {
  let godCount = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  // god List
  // 1,正印,DR,Direct Resource
  // 2,偏印,IR,Indirect Resource
  // 3,正官,DO,Direct Officer
  // 4,七殺,SK,Seven Killings
  // 5,正财,DW,Direct Wealth
  // 6,偏财,IW,Indirect Wealth
  // 7,伤官,HO,Hurting Officer
  // 8,食神,EG,Eating God
  // 9,劫财,RW,Rob Wealth
  // 10,比肩,F,Friend
  if (haveHour == 1) {
    godCount[natal.hour.god.code]++;
  }
  godCount[natal.month.god.code]++;
  godCount[natal.year.god.code]++;
  if (haveHour == 1) {
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
  godCount = godCount.map((element) =>
    parseFloat((element / Math.max(...godCount)).toFixed(3))
  );
  return godCount;
};



const getElementCount = (natal, haveHour) => {
  let percentArray = [0, 0, 0, 0, 0];
  // Check if Natal Chart have Hour (animal.code = 0 mean there is no data )
  if (haveHour === 1) {
    percentArray[natal.hour.heaven_element.code % 5] += 10;
  }
  percentArray[natal.day.heaven_element.code % 5] += 10;
  percentArray[natal.month.heaven_element.code % 5] += 10;
  percentArray[natal.year.heaven_element.code % 5] += 10;

  if (haveHour === 1) {
    percentArray[natal.hour.earth_element.code % 5] += 10;
  }
  percentArray[natal.day.earth_element.code % 5] += 10;
  percentArray[natal.month.earth_element.code % 5] += 10;
  percentArray[natal.year.earth_element.code % 5] += 10;

  if (haveHour === 1) {
    let computedCap = getCap(natal.hour.hidden_stem);
    natal.hour.hidden_stem.forEach((hour) => {
      percentArray[hour.element.code % 5] += computedCap;
    });
  }
  computedCap = getCap(natal.day.hidden_stem);
  natal.day.hidden_stem.forEach((day) => {
    percentArray[day.element.code % 5] += computedCap;
  });
  computedCap = getCap(natal.month.hidden_stem);
  natal.month.hidden_stem.forEach((month) => {
    percentArray[month.element.code % 5] += computedCap;
  });
  computedCap = getCap(natal.year.hidden_stem);
  natal.year.hidden_stem.forEach((year) => {
    percentArray[year.element.code % 5] += computedCap;
  });

  return percentArray;
};

app.use("/", (req, res, next) => {
  res.send("no page found");
  next();
});

app.listen(3000);
